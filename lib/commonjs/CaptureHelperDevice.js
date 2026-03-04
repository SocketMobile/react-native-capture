"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CaptureHelperDevice = void 0;
var _socketmobileCapturejs = require("socketmobile-capturejs");
// src/CaptureHelperDevice.ts

// Type-only import to avoid circular runtime dependency.

/** Internal interface — only what CaptureHelperDevice needs from a capture instance */

/**
 * Wraps a connected device's CaptureRn with typed property methods.
 * Created automatically by CaptureHelper — never instantiated by developers.
 *
 * All methods throw on error; wrap calls in try/catch.
 */
class CaptureHelperDevice {
  /**
   * The underlying device capture — exposed for SocketCam component compatibility.
   * Prefer using the typed methods on this class instead of calling devCapture directly.
   */

  constructor(info, capture) {
    this.name = info.name;
    this.guid = info.guid;
    this.type = info.type;
    this.handle = info.handle;
    this.devCapture = capture;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  async _get(id, type = _socketmobileCapturejs.CapturePropertyTypes.None, value = {}) {
    const property = new _socketmobileCapturejs.CaptureProperty(id, type, value);
    const result = await this.devCapture.getProperty(property);
    return result.value;
  }
  async _set(id, type, value) {
    const property = new _socketmobileCapturejs.CaptureProperty(id, type, value);
    await this.devCapture.setProperty(property);
  }

  // ─── Device Info ───────────────────────────────────────────────────────────

  /** Get the device's friendly (display) name */
  // It is also possible to get this from the 'name' property of CaptureHelperDevice which avoids an asynchronous call
  async getFriendlyName() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.FriendlyNameDevice);
  }

  /** Set the device's friendly name. Max 31 UTF-8 characters. */
  async setFriendlyName(name) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.FriendlyNameDevice, _socketmobileCapturejs.CapturePropertyTypes.String, name);
  }

  /** Get the device's Bluetooth MAC address as a byte array */
  async getBluetoothAddress() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.BluetoothAddressDevice);
  }

  /** Get the device type (see CaptureDeviceType enum) */
  // It is also possible to get this from the 'type' property of CaptureHelperDevice which avoids an asynchronous call
  async getDeviceType() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.DeviceType);
  }

  /** Get the device firmware version */
  async getFirmwareVersion() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.VersionDevice);
  }

  // ─── Status ────────────────────────────────────────────────────────────────

  /** Get the current battery level (0–100%) */
  async getBatteryLevel() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.BatteryLevelDevice);
  }

  /** Get the current power state (see PowerState enum) */
  async getPowerState() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.PowerStateDevice);
  }

  /** Get the current buttons state (see ButtonsState enum) */
  async getButtonsState() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.ButtonsStatusDevice);
  }

  // ─── Scan Control ──────────────────────────────────────────────────────────

  /**
   * Set the scan trigger.
   * Use Trigger.Start to fire a scan, Trigger.Stop to abort,
   * Trigger.Enable/Disable to enable or lock the physical button.
   */
  async setTrigger(trigger) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.TriggerDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, trigger);
  }

  /**
   * Get a data source (symbology or NFC tag type) by ID.
   * Returns an object with { id, name, enabled } describing the current state.
   */
  async getDataSource(dataSourceId) {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.DataSourceDevice, _socketmobileCapturejs.CapturePropertyTypes.DataSource, {
      id: dataSourceId,
      flags: _socketmobileCapturejs.CaptureDataSourceFlags.Status
    });
  }

  /**
   * Enable or disable a symbology or NFC tag type by ID.
   * Use CaptureDataSourceID constants for the id.
   */
  async setDataSource(dataSourceId, enabled) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.DataSourceDevice, _socketmobileCapturejs.CapturePropertyTypes.DataSource, {
      id: dataSourceId,
      flags: _socketmobileCapturejs.CaptureDataSourceFlags.Status,
      status: enabled
    });
  }

  /** Get the local decode action (beep/flash/rumble on good read) */
  async getDecodeAction() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.LocalDecodeActionDevice);
  }

  /** Set the local decode action (see LocalDecodeAction enum) */
  async setDecodeAction(action) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.LocalDecodeActionDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, action);
  }

  /** Get the local data acknowledgment mode (see DeviceDataAcknowledgment enum) */
  async getDataAcknowledgment() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.LocalAcknowledgmentDevice);
  }

  /** Set the local data acknowledgment mode */
  async setDataAcknowledgment(mode) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.LocalAcknowledgmentDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, mode);
  }

  /**
   * Acknowledge decoded data — required when DataConfirmationMode is ModeApp.
   * Can also be called any time to give feedback to the user (e.g. red LED for bad scan).
   */
  async setDataConfirmation(led, beep, rumble) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.DataConfirmationDevice, _socketmobileCapturejs.CapturePropertyTypes.Ulong, {
      led,
      beep,
      rumble
    });
  }

  /** Get the current notification flags (see Notifications enum) */
  async getNotifications() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.NotificationsDevice);
  }

  /** Set which events the device reports (battery, power, buttons, etc.) */
  async setNotifications(flags) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.NotificationsDevice, _socketmobileCapturejs.CapturePropertyTypes.Ulong, flags);
  }

  /** Get the current data output format (see DataFormat enum) */
  async getDataFormat() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.DataFormatDevice);
  }

  /** Set the data output format (e.g. TagTypeAndData for NFC) */
  async setDataFormat(format) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.DataFormatDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, format);
  }

  /**
   * Send a device-specific raw command and receive the response.
   * Use only when you know the device's proprietary command set.
   */
  async getDeviceSpecificCommand(command) {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.DeviceSpecific, _socketmobileCapturejs.CapturePropertyTypes.Array, command);
  }

  // ─── Configuration ─────────────────────────────────────────────────────────

  /** Get the stand (cradle) configuration (see StandConfig enum) */
  async getStandConfig() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.StandConfigDevice);
  }

  /** Set the stand (cradle) configuration */
  async setStandConfig(config) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.StandConfigDevice, _socketmobileCapturejs.CapturePropertyTypes.Ulong, config);
  }

  /**
   * Get the device timers.
   * Returns: { triggerLockTimer, connectedPowerOffTimer, disconnectedPowerOffTimer }
   * Times are in milliseconds (power timers) and 1/4 seconds (trigger lock timer).
   */
  async getTimers() {
    return this._get(_socketmobileCapturejs.CapturePropertyIds.TimersDevice);
  }

  /**
   * Set the device timers.
   * @param mask - Which timers to apply (see Timer enum flags)
   * @param connectedPowerOffTimer - Milliseconds before powering off when connected
   * @param disconnectedPowerOffTimer - Milliseconds before powering off when disconnected
   * @param triggerLockTimer - 1/4 seconds before locking trigger (used with app data confirmation)
   */
  async setTimers(mask, connectedPowerOffTimer, disconnectedPowerOffTimer, triggerLockTimer) {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.TimersDevice, _socketmobileCapturejs.CapturePropertyTypes.Array, {
      mask,
      connectedPowerOffTimer,
      disconnectedPowerOffTimer,
      triggerLockTimer
    });
  }

  // ─── BLE Device Lifecycle ──────────────────────────────────────────────────

  /** Disconnect the BLE device (makes it available for reconnect) */
  async setDisconnect() {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.DisconnectDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, _socketmobileCapturejs.Disconnect.MakeAvailable);
  }

  /** Factory reset the device */
  async setFactoryReset() {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.RestoreFactoryDefaultsDevice, _socketmobileCapturejs.CapturePropertyTypes.None, {});
  }

  /** Power cycle (reset) the device. If on power, it reboots; otherwise it powers off. */
  async setReset() {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.ResetDevice, _socketmobileCapturejs.CapturePropertyTypes.None, {});
  }

  /** Power off the device */
  async setPowerOff() {
    return this._set(_socketmobileCapturejs.CapturePropertyIds.SetPowerOffDevice, _socketmobileCapturejs.CapturePropertyTypes.None, {});
  }
}
exports.CaptureHelperDevice = CaptureHelperDevice;
//# sourceMappingURL=CaptureHelperDevice.js.map