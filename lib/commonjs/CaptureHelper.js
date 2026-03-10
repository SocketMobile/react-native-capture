"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CaptureHelper = void 0;
var _socketmobileCapturejs = require("socketmobile-capturejs");
var _reactNativeCapture = require("react-native-capture");
var _CaptureHelperDevice = require("./CaptureHelperDevice");
var _reactNative = require("react-native");
// Self-referential import — same pattern as the original CaptureHelper.tsx.
// Metro bundler resolves this safely at runtime.

// ─── Callback interface ────────────────────────────────────────────────────

// ─── CaptureHelper ─────────────────────────────────────────────────────────

/**
 * Full lifecycle manager for the CaptureSDK.
 *
 * Usage:
 * ```typescript
 * const helper = new CaptureHelper({
 *   appInfo,
 *   onDeviceArrival: (device) => setDevices(d => [...d, device]),
 *   onDecodedData: (data, device) => setLastScan(data.string),
 * });
 * await helper.open();
 * ```
 */
class CaptureHelper {
  _capture = null;
  _bleDeviceManager = null;

  /**
   * Devices keyed by handle.
   * The handle at DeviceArrival equals the handle used for subsequent device events
   * (DecodedData, BatteryLevel, etc.) from that device.
   */
  _devices = new Map();

  /**
   * Maps device GUID → iOS BLE identifierUuid for devices connected via
   * connectDiscoveredDevice. Required for DisconnectDiscoveredDevice.
   */
  _bleIdentifiers = new Map();

  /**
   * Holds the identifierUuid of the device being connected via
   * connectDiscoveredDevice, until DeviceArrival provides the GUID to map it.
   */
  _pendingIdentifierUuid = null;
  constructor(options) {
    const {
      appInfo,
      ...callbacks
    } = options;
    this._appInfo = appInfo;
    this._callbacks = callbacks;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Open the CaptureSDK. Must be called before any other method.
   * Call once per app session — typically in a top-level useEffect or componentDidMount.
   */
  async open() {
    if (this._capture !== null) {
      throw new Error('CaptureHelper is already open. Call close() before opening again.');
    }
    this._capture = new _reactNativeCapture.CaptureRn();
    await this._capture.open(this._appInfo, this._handleCaptureEvent);
  }

  /**
   * Close the CaptureSDK and release all resources.
   * Call in componentWillUnmount or when the app goes to background.
   */
  async close() {
    // Close all open device captures first
    for (const device of this._devices.values()) {
      try {
        await device.devCapture.close?.();
      } catch {
        // best-effort
      }
    }
    // Close BLE device manager if present
    try {
      await this._bleDeviceManager?.close?.();
    } catch {
      // best-effort
    }
    // Close root capture
    await this._capture?.close();
    // Clear state after close completes
    this._capture = null;
    this._bleDeviceManager = null;
    this._devices.clear();
    this._bleIdentifiers.clear();
    this._pendingIdentifierUuid = null;
  }

  /** Returns the list of currently connected devices */
  getDevices() {
    return Array.from(this._devices.values());
  }

  /**
   * The root CaptureRn instance.
   * Needed when passing `socketCamCapture` to SocketCamViewContainer,
   * which reads the Capture-level SocketCamStatus property from it.
   */
  get rootCapture() {
    return this._capture;
  }

  // ─── Internal helpers ──────────────────────────────────────────────────────

  _findDeviceByGuid(guid) {
    for (const device of this._devices.values()) {
      if (device.guid === guid) return device;
    }
    return undefined;
  }

  // ─── Internal event routing ────────────────────────────────────────────────

  _handleCaptureEvent = async (event, handle = 0) => {
    // The SDK can call this with event=undefined when the Capture Service sends
    // an empty JSON-RPC result ({"result": {}}). Guard before accessing event.id
    // to avoid an uncaught "Cannot read property 'id' of undefined" rejection.
    if (!event) return;
    switch (event.id) {
      case _socketmobileCapturejs.CaptureEventIds.DeviceArrival:
        {
          const deviceCapture = new _reactNativeCapture.CaptureRn();
          try {
            await deviceCapture.openDevice(event.value.guid, this._capture);
          } catch (err) {
            const code = err?.code ?? -1;
            const message = err?.message ?? String(err);
            this._callbacks.onError?.({
              code,
              message
            });
            break;
          }
          // DeviceArrival fires with the capture client handle, not the device handle.
          // After openDevice, clientOrDeviceHandle holds the actual device handle —
          // the same value that subsequent DecodedData / BatteryLevel / Power / Buttons
          // events will carry. Use it as the map key so those lookups succeed.
          const deviceHandle = deviceCapture.clientOrDeviceHandle;
          const device = new _CaptureHelperDevice.CaptureHelperDevice({
            name: event.value.name,
            guid: event.value.guid,
            type: event.value.type,
            handle: deviceHandle
          }, deviceCapture);
          this._devices.set(deviceHandle, device);
          // Map GUID → identifierUuid so disconnectBleDevice can use the correct property.
          if (this._pendingIdentifierUuid) {
            this._bleIdentifiers.set(event.value.guid, this._pendingIdentifierUuid);
            this._pendingIdentifierUuid = null;
          }
          this._callbacks.onDeviceArrival?.(device);
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.DeviceRemoval:
        {
          const device = this._findDeviceByGuid(event.value.guid);
          if (device) {
            try {
              await device.devCapture.close?.();
            } catch (e) {
              console.error('[CaptureHelper] DeviceRemoval devCapture.close() threw:', e);
            }
            this._bleIdentifiers.delete(event.value.guid);
            this._devices.delete(device.handle);
            this._callbacks.onDeviceRemoval?.(device);
          }
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.DeviceManagerArrival:
        {
          const bleCapture = new _reactNativeCapture.CaptureRn();
          try {
            await bleCapture.openDevice(event.value.guid, this._capture);
          } catch (err) {
            const code = err?.code ?? -1;
            const message = err?.message ?? String(err);
            this._callbacks.onError?.({
              code,
              message
            });
            break;
          }
          this._bleDeviceManager = bleCapture;
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.DeviceManagerRemoval:
        {
          this._bleDeviceManager = null;
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.DecodedData:
        {
          const device = this._devices.get(handle);
          if (device) {
            // result -91 (ESKT_CANCEL) means the user closed the SocketCam native view.
            if (event.result === -91) {
              this._callbacks.onSocketCamCanceled?.(device);
            } else {
              this._callbacks.onDecodedData?.(event.value, device);
            }
          }
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.DeviceDiscovered:
        {
          if (_reactNative.Platform.OS === 'ios') {
            this._callbacks.onDiscoveredDevice?.(event.value);
          } else {
            // Android: event.value can be either:
            //   a) A JSON string  → parse it first
            //   b) A plain object → may use identifierUUID/serviceUUID instead of identifierUuid/serviceUuid
            let raw = event.value;
            if (typeof raw === 'string') {
              try {
                raw = JSON.parse(raw);
              } catch (e) {
                this._callbacks.onError?.({
                  code: _socketmobileCapturejs.SktErrors.ESKT_INCORRECTNUMBEROFPARAMETERS,
                  message: `DeviceDiscovered: invalid parameters — ${e}`
                });
                break;
              }
            }
            const discoveredDevice = {
              name: raw.name ?? '',
              identifierUuid: raw.identifierUUID ?? raw.identifierUuid ?? '',
              serviceUuid: raw.serviceUUID ?? raw.serviceUuid ?? ''
            };
            this._callbacks.onDiscoveredDevice?.(discoveredDevice);
          }
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.DiscoveryEnd:
        {
          this._callbacks.onDiscoveryEnd?.(event.result);
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.BatteryLevel:
        {
          const device = this._devices.get(handle);
          if (device) {
            this._callbacks.onBatteryLevel?.(event.value, device);
          }
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.Power:
        {
          const device = this._devices.get(handle);
          if (device) {
            this._callbacks.onPowerState?.(event.value, device);
          }
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.Buttons:
        {
          const device = this._devices.get(handle);
          if (device) {
            this._callbacks.onButtons?.(event.value, device);
          }
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.Error:
        {
          console.error('[CaptureHelper] Error event handle:', handle, 'value:', JSON.stringify(event.value));
          this._callbacks.onError?.(event.value);
          break;
        }
      case _socketmobileCapturejs.CaptureEventIds.LogTrace:
        {
          this._callbacks.onLogTrace?.(event.value);
          break;
        }
      default:
        break;
    }
  };

  // ─── Capture-level properties ──────────────────────────────────────────────

  async _get(id, type = _socketmobileCapturejs.CapturePropertyTypes.None, value = {}) {
    if (!this._capture) throw new Error('CaptureHelper is not open');
    const property = new _socketmobileCapturejs.CaptureProperty(id, type, value);
    const result = await this._capture.getProperty(property);
    return result.value;
  }
  async _set(id, type, value) {
    if (!this._capture) throw new Error('CaptureHelper is not open');
    const property = new _socketmobileCapturejs.CaptureProperty(id, type, value);
    await this._capture.setProperty(property);
  }
  async _setBle(id, type, value) {
    if (!this._bleDeviceManager) throw new Error('BLE Device Manager is not available');
    const property = new _socketmobileCapturejs.CaptureProperty(id, type, value);
    await this._bleDeviceManager.setProperty(property);
  }
  async _getBle(id, type = _socketmobileCapturejs.CapturePropertyTypes.None, value = {}) {
    if (!this._bleDeviceManager) throw new Error('BLE Device Manager is not available');
    const property = new _socketmobileCapturejs.CaptureProperty(id, type, value);
    const result = await this._bleDeviceManager.getProperty(property);
    return result.value;
  }

  /** Get the CaptureSDK version */
  async getVersion() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.Version);
  }

  /**
   * Show or hide the SocketCam symbology selector menu.
   * When disabled, the end user cannot change enabled symbologies from the SocketCam view.
   */
  async setSocketCamSymbologySelectorDisabled(disabled) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.Configuration, _socketmobileCapturejs.CapturePropertyTypes.String, disabled ? 'SocketCamSymbologySelector=disabled' : 'SocketCamSymbologySelector=enabled');
  }

  /** Get the current SocketCam enabled/disabled status as a raw byte value */
  async getSocketCamEnabled() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.SocketCamStatus, _socketmobileCapturejs.CapturePropertyTypes.None);
  }

  /**
   * Enable or disable the SocketCam virtual device (Android + iOS).
   * When enabled, a DeviceArrival event fires for the SocketCam device.
   * When disabled, a DeviceRemoval event fires.
   *
   * Android note: enabling requires the SocketCam extension APK to be installed.
   */
  async setSocketCamEnabled(enabled) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.SocketCamStatus, _socketmobileCapturejs.CapturePropertyTypes.Byte, enabled ? _socketmobileCapturejs.SocketCam.Enable : _socketmobileCapturejs.SocketCam.Disable);
  }

  /**
   * Start BLE discovery or launch the iOS Bluetooth Classic picker.
   * Listen for discovered devices via the onDiscoveredDevice callback.
   * When discovery ends, onDiscoveryEnd is called.
   *
   * @param mode - 1 for Bluetooth LE, 2 for Bluetooth Classic
   */
  async addBluetoothDevice(mode) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.AddDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, mode);
  }

  /**
   * Connect to a BLE device found during discovery.
   * Requires DeviceManagerArrival to have fired (BLE device manager must be available).
   * On success, onDeviceArrival will fire with the connected CaptureHelperDevice.
   */
  async connectDiscoveredDevice(device) {
    // Store identifierUuid so DeviceArrival can map it to the device GUID,
    // enabling disconnectBleDevice to use DisconnectDiscoveredDevice later.
    this._pendingIdentifierUuid = device.identifierUuid;
    return this._setBle(_socketmobileCapturejs.CapturePropertyIds.ConnectDiscoveredDevice, _socketmobileCapturejs.CapturePropertyTypes.String, _reactNative.Platform.OS === 'android' ? device.identifierUuid : device.identifierUuid + ";" + device.serviceUuid);
  }

  /**
   * Remove a connected BLE discovered device.
   *
   * The device's native CaptureSDK handle is closed in the subsequent DeviceRemoval
   * event handler, not here — closing before the SDK disconnect corrupts SDK state.
   */
  async removeBleDevice(device) {
    if (_reactNative.Platform.OS === 'android') {
      const deviceUuid = await this.getDeviceUniqueIdentifier(device.guid);
      await this._set(_socketmobileCapturejs.CapturePropertyIds.RemoveDevice, _socketmobileCapturejs.CapturePropertyTypes.String, deviceUuid);
    } else {
      await this._set(_socketmobileCapturejs.CapturePropertyIds.RemoveDevice, _socketmobileCapturejs.CapturePropertyTypes.String, device.guid);
    }
  }

  /** Disconnect from a connected BLE device (by its discovered device info) */
  async disconnectFromDiscoveredDevice(device) {
    return this._setBle(_socketmobileCapturejs.CapturePropertyIds.DisconnectDiscoveredDevice, _socketmobileCapturejs.CapturePropertyTypes.String, device.identifierUuid);
  }

  /**
   * Get the unique identifier string for a BLE device from its GUID.
   * Useful for building persistent device associations.
   */
  async getDeviceUniqueIdentifier(deviceGuid) {
    return this._getBle(_socketmobileCapturejs.CapturePropertyIds.UniqueDeviceIdentifier, _socketmobileCapturejs.CapturePropertyTypes.String, deviceGuid);
  }
}
exports.CaptureHelper = CaptureHelper;
var _default = exports.default = CaptureHelper;
//# sourceMappingURL=CaptureHelper.js.map