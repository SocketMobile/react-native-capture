import {
  CapturePropertyIds,
  CapturePropertyTypes,
  CaptureProperty,
  CaptureEventIds,
  SocketCam,
  type CaptureEvent,
  type PowerState,
  type Notifications,
  type DiscoveredDeviceInfo,
} from 'socketmobile-capturejs';

// Self-referential import — same pattern as the original CaptureHelper.tsx.
// Metro bundler resolves this safely at runtime.
import {
  CaptureRn,
  type AppInfoRn,
  type DecodedData,
  type BluetoothDiscoveryMode,
} from 'react-native-capture';

import { CaptureHelperDevice } from './CaptureHelperDevice';

export type { CaptureHelperDevice };

// ─── Callback interface ────────────────────────────────────────────────────

export interface CaptureHelperCallbacks {
  /** Called when a device (scanner, NFC reader, SocketCam) connects */
  onDeviceArrival?: (device: CaptureHelperDevice) => void;

  /** Called when a device disconnects */
  onDeviceRemoval?: (device: CaptureHelperDevice) => void;

  /** Called when a device produces a barcode scan or NFC read */
  onDecodedData?: (data: DecodedData, device: CaptureHelperDevice) => void;

  /**
   * Called when the user closes the SocketCam native view (result code -91 / ESKT_CANCEL).
   * Use this to hide the SocketCam view and reset any continuous-scan state.
   */
  onSocketCamCanceled?: (device: CaptureHelperDevice) => void;

  /** Called during BLE discovery when a device is found (before connecting) */
  onDiscoveredDevice?: (device: DiscoveredDeviceInfo) => void;

  /** Called when a BLE discovery scan ends */
  onDiscoveryEnd?: (result: number) => void;

  /** Called when a device's battery level changes */
  onBatteryLevel?: (level: number, device: CaptureHelperDevice) => void;

  /** Called when a device's power state changes (on battery / on cradle / on AC) */
  onPowerState?: (state: PowerState, device: CaptureHelperDevice) => void;

  /** Called when the state of a device's buttons changes */
  onButtons?: (state: Notifications, device: CaptureHelperDevice) => void;

  /** Called on SDK errors */
  onError?: (error: { code: number; message: string }) => void;

  /** Called when the SDK emits a log trace (requires setLogger before open) */
  onLogTrace?: (trace: string) => void;
}

export interface CaptureHelperOptions extends CaptureHelperCallbacks {
  appInfo: AppInfoRn;
}

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
export class CaptureHelper {
  private _capture: CaptureRn | null = null;
  private _bleDeviceManager: CaptureRn | null = null;

  /**
   * Devices keyed by handle.
   * The handle at DeviceArrival equals the handle used for subsequent device events
   * (DecodedData, BatteryLevel, etc.) from that device.
   */
  private _devices: Map<number, CaptureHelperDevice> = new Map();

  /**
   * Maps device GUID → iOS BLE identifierUuid for devices connected via
   * connectDiscoveredDevice. Required for DisconnectDiscoveredDevice.
   */
  private _bleIdentifiers: Map<string, string> = new Map();

  /**
   * Holds the identifierUuid of the device being connected via
   * connectDiscoveredDevice, until DeviceArrival provides the GUID to map it.
   */
  private _pendingIdentifierUuid: string | null = null;

  private _appInfo: AppInfoRn;
  private _callbacks: CaptureHelperCallbacks;

  constructor(options: CaptureHelperOptions) {
    const { appInfo, ...callbacks } = options;
    this._appInfo = appInfo;
    this._callbacks = callbacks;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Open the CaptureSDK. Must be called before any other method.
   * Call once per app session — typically in a top-level useEffect or componentDidMount.
   */
  async open(): Promise<void> {
    if (this._capture !== null) {
      throw new Error('CaptureHelper is already open. Call close() before opening again.');
    }
    this._capture = new CaptureRn();
    await this._capture.open(this._appInfo, this._handleCaptureEvent);
  }

  /**
   * Close the CaptureSDK and release all resources.
   * Call in componentWillUnmount or when the app goes to background.
   */
  async close(): Promise<void> {
    // Close all open device captures first
    for (const device of this._devices.values()) {
      try {
        await (device.devCapture as any).close?.();
      } catch {
        // best-effort
      }
    }
    // Close BLE device manager if present
    try {
      await (this._bleDeviceManager as any)?.close?.();
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
  getDevices(): CaptureHelperDevice[] {
    return Array.from(this._devices.values());
  }

  /**
   * The root CaptureRn instance.
   * Needed when passing `socketCamCapture` to SocketCamViewContainer,
   * which reads the Capture-level SocketCamStatus property from it.
   */
  get rootCapture(): CaptureRn | null {
    return this._capture;
  }

  // ─── Internal helpers ──────────────────────────────────────────────────────

  private _findDeviceByGuid(guid: string): CaptureHelperDevice | undefined {
    for (const device of this._devices.values()) {
      if (device.guid === guid) return device;
    }
    return undefined;
  }

  // ─── Internal event routing ────────────────────────────────────────────────

  private _handleCaptureEvent = async (
    event: CaptureEvent<any>,
    handle: number = 0
  ): Promise<void> => {
    // The SDK can call this with event=undefined when the Capture Service sends
    // an empty JSON-RPC result ({"result": {}}). Guard before accessing event.id
    // to avoid an uncaught "Cannot read property 'id' of undefined" rejection.
    if (!event) return;
    switch (event.id) {
      case CaptureEventIds.DeviceArrival: {
        const deviceCapture = new CaptureRn();
        try {
          await deviceCapture.openDevice(event.value.guid, this._capture!);
        } catch (err: unknown) {
          const code = (err as any)?.code ?? -1;
          const message = (err as any)?.message ?? String(err);
          this._callbacks.onError?.({ code, message });
          break;
        }
        // DeviceArrival fires with the capture client handle, not the device handle.
        // After openDevice, clientOrDeviceHandle holds the actual device handle —
        // the same value that subsequent DecodedData / BatteryLevel / Power / Buttons
        // events will carry. Use it as the map key so those lookups succeed.
        const deviceHandle = deviceCapture.clientOrDeviceHandle;
        const device = new CaptureHelperDevice(
          {
            name: event.value.name,
            guid: event.value.guid,
            type: event.value.type,
            handle: deviceHandle,
          },
          deviceCapture
        );
        this._devices.set(deviceHandle, device);
        // Map GUID → identifierUuid so disconnectBleDevice can use the correct property.
        if (this._pendingIdentifierUuid) {
          this._bleIdentifiers.set(event.value.guid, this._pendingIdentifierUuid);
          this._pendingIdentifierUuid = null;
        }
        this._callbacks.onDeviceArrival?.(device);
        break;
      }

      case CaptureEventIds.DeviceRemoval: {
        const device = this._findDeviceByGuid(event.value.guid);
        if (device) {
          try {
            await (device.devCapture as any).close?.();
          } catch (e) {
            console.error('[CaptureHelper] DeviceRemoval devCapture.close() threw:', e);
          }
          this._bleIdentifiers.delete(event.value.guid);
          this._devices.delete(device.handle);
          this._callbacks.onDeviceRemoval?.(device);
        }
        break;
      }

      case CaptureEventIds.DeviceManagerArrival: {
        const bleCapture = new CaptureRn();
        try {
          await bleCapture.openDevice(event.value.guid, this._capture!);
        } catch (err: unknown) {
          const code = (err as any)?.code ?? -1;
          const message = (err as any)?.message ?? String(err);
          this._callbacks.onError?.({ code, message });
          break;
        }
        this._bleDeviceManager = bleCapture;
        break;
      }

      case CaptureEventIds.DeviceManagerRemoval: {
        this._bleDeviceManager = null;
        break;
      }

      case CaptureEventIds.DecodedData: {
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

      case CaptureEventIds.DeviceDiscovered: {
        this._callbacks.onDiscoveredDevice?.(event.value);
        break;
      }

      case CaptureEventIds.DiscoveryEnd: {
        this._callbacks.onDiscoveryEnd?.(event.result);
        break;
      }

      case CaptureEventIds.BatteryLevel: {
        const device = this._devices.get(handle);
        if (device) {
          this._callbacks.onBatteryLevel?.(event.value, device);
        }
        break;
      }

      case CaptureEventIds.Power: {
        const device = this._devices.get(handle);
        if (device) {
          this._callbacks.onPowerState?.(event.value, device);
        }
        break;
      }

      case CaptureEventIds.Buttons: {
        const device = this._devices.get(handle);
        if (device) {
          this._callbacks.onButtons?.(event.value, device);
        }
        break;
      }

      case CaptureEventIds.Error: {
        console.error('[CaptureHelper] Error event handle:', handle, 'value:', JSON.stringify(event.value));
        this._callbacks.onError?.(event.value);
        break;
      }

      case CaptureEventIds.LogTrace: {
        this._callbacks.onLogTrace?.(event.value);
        break;
      }

      default:
        break;
    }
  };

  // ─── Capture-level properties ──────────────────────────────────────────────

  private async _get(
    id: CapturePropertyIds,
    type: CapturePropertyTypes = CapturePropertyTypes.None,
    value: any = {}
  ): Promise<any> {
    if (!this._capture) throw new Error('CaptureHelper is not open');
    const property = new CaptureProperty(id, type, value);
    const result = await this._capture.getProperty(property);
    return result.value;
  }

  private async _set(
    id: CapturePropertyIds,
    type: CapturePropertyTypes,
    value: any
  ): Promise<void> {
    if (!this._capture) throw new Error('CaptureHelper is not open');
    const property = new CaptureProperty(id, type, value);
    await this._capture.setProperty(property);
  }

  private async _setBle(
    id: CapturePropertyIds,
    type: CapturePropertyTypes,
    value: any
  ): Promise<void> {
    if (!this._bleDeviceManager) throw new Error('BLE Device Manager is not available');
    const property = new CaptureProperty(id, type, value);
    await this._bleDeviceManager.setProperty(property);
  }

  private async _getBle(
    id: CapturePropertyIds,
    type: CapturePropertyTypes = CapturePropertyTypes.None,
    value: any = {}
  ): Promise<any> {
    if (!this._bleDeviceManager) throw new Error('BLE Device Manager is not available');
    const property = new CaptureProperty(id, type, value);
    const result = await this._bleDeviceManager.getProperty(property);
    return result.value;
  }

  /** Get the CaptureSDK version */
  async getVersion(): Promise<{ major: number; minor: number; build: number }> {
    return this._get(CapturePropertyIds.Version);
  }

  /**
   * Show or hide the SocketCam symbology selector menu.
   * When disabled, the end user cannot change enabled symbologies from the SocketCam view.
   */
  async setSocketCamSymbologySelectorDisabled(disabled: boolean): Promise<void> {
    return this._set(
      CapturePropertyIds.Configuration,
      CapturePropertyTypes.String,
      disabled ? 'SocketCamSymbologySelector=disabled' : 'SocketCamSymbologySelector=enabled'
    );
  }

  /** Get the current SocketCam enabled/disabled status as a raw byte value */
  async getSocketCamEnabled(): Promise<any> {
    return this._get(CapturePropertyIds.SocketCamStatus, CapturePropertyTypes.None);
  }

  /**
   * Enable or disable the SocketCam virtual device (Android + iOS).
   * When enabled, a DeviceArrival event fires for the SocketCam device.
   * When disabled, a DeviceRemoval event fires.
   *
   * Android note: enabling requires the SocketCam extension APK to be installed.
   */
  async setSocketCamEnabled(enabled: boolean): Promise<void> {
    return this._set(
      CapturePropertyIds.SocketCamStatus,
      CapturePropertyTypes.Byte,
      enabled ? SocketCam.Enable : SocketCam.Disable
    );
  }

  /**
   * Start BLE discovery or launch the iOS Bluetooth Classic picker.
   * Listen for discovered devices via the onDiscoveredDevice callback.
   * When discovery ends, onDiscoveryEnd is called.
   *
   * @param mode - 1 for Bluetooth LE, 2 for Bluetooth Classic
   */
  async addBluetoothDevice(mode: BluetoothDiscoveryMode): Promise<void> {
    return this._set(CapturePropertyIds.AddDevice, CapturePropertyTypes.Byte, mode);
  }

  /**
   * Connect to a BLE device found during discovery.
   * Requires DeviceManagerArrival to have fired (BLE device manager must be available).
   * On success, onDeviceArrival will fire with the connected CaptureHelperDevice.
   */
  async connectDiscoveredDevice(device: DiscoveredDeviceInfo): Promise<void> {
    // Store identifierUuid so DeviceArrival can map it to the device GUID,
    // enabling disconnectBleDevice to use DisconnectDiscoveredDevice later.
    this._pendingIdentifierUuid = device.identifierUuid;
    return this._setBle(
      CapturePropertyIds.ConnectDiscoveredDevice,
      CapturePropertyTypes.String,
      device.identifierUuid + ";" + device.serviceUuid
    );
  }

  /**
   * Remove a connected BLE discovered device.
   *
   * The device's native CaptureSDK handle is closed in the subsequent DeviceRemoval
   * event handler, not here — closing before the SDK disconnect corrupts SDK state.
   */
  async removeBleDevice(device: CaptureHelperDevice): Promise<void> {
      await this._set(CapturePropertyIds.RemoveDevice, CapturePropertyTypes.String, device.guid);
  }

  /** Disconnect from a connected BLE device (by its discovered device info) */
  async disconnectFromDiscoveredDevice(device: DiscoveredDeviceInfo): Promise<void> {
    return this._setBle(
      CapturePropertyIds.DisconnectDiscoveredDevice,
      CapturePropertyTypes.String,
      device.identifierUuid
    );
  }

  /**
   * Get the unique identifier string for a BLE device from its GUID.
   * Useful for building persistent device associations.
   */
  async getDeviceUniqueIdentifier(deviceGuid: string): Promise<string> {
    return this._getBle(
      CapturePropertyIds.UniqueDeviceIdentifier,
      CapturePropertyTypes.String,
      deviceGuid
    );
  }

}

export default CaptureHelper;
