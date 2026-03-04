// src/CaptureHelperDevice.ts
import {
  CapturePropertyIds,
  CapturePropertyTypes,
  CaptureProperty,
  CaptureDataSourceStatus,
  CaptureDataSourceFlags,
  Disconnect,
  type Trigger,
  type DataFormat,
  type StandConfig,
  type LocalDecodeAction,
  type DeviceDataAcknowledgment,
  type DataConfirmationLed,
  type DataConfirmationBeep,
  type DataConfirmationRumble,
  type Notifications,
  type PowerState,
  type Timer,
} from 'socketmobile-capturejs';

// Type-only import to avoid circular runtime dependency.
import type { CaptureRn } from 'react-native-capture';

/** Internal interface — only what CaptureHelperDevice needs from a capture instance */
interface CaptureAPI {
  getProperty(property: CaptureProperty<any>): Promise<CaptureProperty<any>>;
  setProperty(property: CaptureProperty<any>): Promise<CaptureProperty<unknown>>;
}

export interface CaptureHelperDeviceInfo {
  name: string;
  guid: string;
  type: number;
  handle: number;
}

/**
 * Wraps a connected device's CaptureRn with typed property methods.
 * Created automatically by CaptureHelper — never instantiated by developers.
 *
 * All methods throw on error; wrap calls in try/catch.
 */
export class CaptureHelperDevice {
  readonly name: string;
  readonly guid: string;
  readonly type: number;
  readonly handle: number;

  /**
   * The underlying device capture — exposed for SocketCam component compatibility.
   * Prefer using the typed methods on this class instead of calling devCapture directly.
   */
  readonly devCapture: CaptureAPI;

  constructor(info: CaptureHelperDeviceInfo, capture: CaptureRn) {
    this.name = info.name;
    this.guid = info.guid;
    this.type = info.type;
    this.handle = info.handle;
    this.devCapture = capture as unknown as CaptureAPI;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async _get(
    id: CapturePropertyIds,
    type: CapturePropertyTypes = CapturePropertyTypes.None,
    value: any = {}
  ): Promise<any> {
    const property = new CaptureProperty(id, type, value);
    const result = await this.devCapture.getProperty(property);
    return result.value;
  }

  private async _set(
    id: CapturePropertyIds,
    type: CapturePropertyTypes,
    value: any
  ): Promise<void> {
    const property = new CaptureProperty(id, type, value);
    await this.devCapture.setProperty(property);
  }

  // ─── Device Info ───────────────────────────────────────────────────────────

  /** Get the device's friendly (display) name */
  // It is also possible to get this from the 'name' property of CaptureHelperDevice which avoids an asynchronous call
  async getFriendlyName(): Promise<string> {
    return this._get(CapturePropertyIds.FriendlyNameDevice);
  }

  /** Set the device's friendly name. Max 31 UTF-8 characters. */
  async setFriendlyName(name: string): Promise<void> {
    return this._set(CapturePropertyIds.FriendlyNameDevice, CapturePropertyTypes.String, name);
  }

  /** Get the device's Bluetooth MAC address as a byte array */
  async getBluetoothAddress(): Promise<number[]> {
    return this._get(CapturePropertyIds.BluetoothAddressDevice);
  }

  /** Get the device type (see CaptureDeviceType enum) */
  // It is also possible to get this from the 'type' property of CaptureHelperDevice which avoids an asynchronous call
  async getDeviceType(): Promise<number> {
    return this._get(CapturePropertyIds.DeviceType);
  }

  /** Get the device firmware version */
  async getFirmwareVersion(): Promise<{
    major: number;
    middle: number;
    minor: number;
    build: number;
    year?: number;
    month?: number;
    day?: number;
  }> {
    return this._get(CapturePropertyIds.VersionDevice);
  }

  // ─── Status ────────────────────────────────────────────────────────────────

  /** Get the current battery level (0–100%) */
  async getBatteryLevel(): Promise<number> {
    return this._get(CapturePropertyIds.BatteryLevelDevice);
  }

  /** Get the current power state (see PowerState enum) */
  async getPowerState(): Promise<PowerState> {
    return this._get(CapturePropertyIds.PowerStateDevice);
  }

  /** Get the current buttons state (see ButtonsState enum) */
  async getButtonsState(): Promise<Notifications> {
    return this._get(CapturePropertyIds.ButtonsStatusDevice);
  }

  // ─── Scan Control ──────────────────────────────────────────────────────────

  /**
   * Set the scan trigger.
   * Use Trigger.Start to fire a scan, Trigger.Stop to abort,
   * Trigger.Enable/Disable to enable or lock the physical button.
   */
  async setTrigger(trigger: Trigger): Promise<void> {
    return this._set(CapturePropertyIds.TriggerDevice, CapturePropertyTypes.Byte, trigger);
  }

  /**
   * Get a data source (symbology or NFC tag type) by ID.
   * Returns an object with { id, name, enabled } describing the current state.
   */
  async getDataSource(dataSourceId: number): Promise<{ id: number; name: string; status: CaptureDataSourceStatus }> {
    return this._get(
      CapturePropertyIds.DataSourceDevice,
      CapturePropertyTypes.DataSource,
      { id: dataSourceId, flags: CaptureDataSourceFlags.Status }
    );
  }

  /**
   * Enable or disable a symbology or NFC tag type by ID.
   * Use CaptureDataSourceID constants for the id.
   */
  async setDataSource(dataSourceId: number, enabled: CaptureDataSourceStatus): Promise<void> {
    return this._set(CapturePropertyIds.DataSourceDevice, CapturePropertyTypes.DataSource, 
      { id: dataSourceId, flags: CaptureDataSourceFlags.Status, status: enabled }
    );
  }

  /** Get the local decode action (beep/flash/rumble on good read) */
  async getDecodeAction(): Promise<LocalDecodeAction> {
    return this._get(CapturePropertyIds.LocalDecodeActionDevice);
  }

  /** Set the local decode action (see LocalDecodeAction enum) */
  async setDecodeAction(action: LocalDecodeAction): Promise<void> {
    return this._set(CapturePropertyIds.LocalDecodeActionDevice, CapturePropertyTypes.Byte, action);
  }

  /** Get the local data acknowledgment mode (see DeviceDataAcknowledgment enum) */
  async getDataAcknowledgment(): Promise<DeviceDataAcknowledgment> {
    return this._get(CapturePropertyIds.LocalAcknowledgmentDevice);
  }

  /** Set the local data acknowledgment mode */
  async setDataAcknowledgment(mode: DeviceDataAcknowledgment): Promise<void> {
    return this._set(CapturePropertyIds.LocalAcknowledgmentDevice, CapturePropertyTypes.Byte, mode);
  }

  /**
   * Acknowledge decoded data — required when DataConfirmationMode is ModeApp.
   * Can also be called any time to give feedback to the user (e.g. red LED for bad scan).
   */
  async setDataConfirmation(
    led: DataConfirmationLed,
    beep: DataConfirmationBeep,
    rumble: DataConfirmationRumble
  ): Promise<void> {
    return this._set(CapturePropertyIds.DataConfirmationDevice, CapturePropertyTypes.Ulong, {
      led,
      beep,
      rumble,
    });
  }

  /** Get the current notification flags (see Notifications enum) */
  async getNotifications(): Promise<Notifications> {
    return this._get(CapturePropertyIds.NotificationsDevice);
  }

  /** Set which events the device reports (battery, power, buttons, etc.) */
  async setNotifications(flags: Notifications): Promise<void> {
    return this._set(CapturePropertyIds.NotificationsDevice, CapturePropertyTypes.Ulong, flags);
  }

  /** Get the current data output format (see DataFormat enum) */
  async getDataFormat(): Promise<DataFormat> {
    return this._get(CapturePropertyIds.DataFormatDevice);
  }

  /** Set the data output format (e.g. TagTypeAndData for NFC) */
  async setDataFormat(format: DataFormat): Promise<void> {
    return this._set(CapturePropertyIds.DataFormatDevice, CapturePropertyTypes.Byte, format);
  }

  /**
   * Send a device-specific raw command and receive the response.
   * Use only when you know the device's proprietary command set.
   */
  async getDeviceSpecificCommand(command: number[]): Promise<number[]> {
    return this._get(CapturePropertyIds.DeviceSpecific, CapturePropertyTypes.Array, command);
  }

  // ─── Configuration ─────────────────────────────────────────────────────────

  /** Get the stand (cradle) configuration (see StandConfig enum) */
  async getStandConfig(): Promise<StandConfig> {
    return this._get(CapturePropertyIds.StandConfigDevice);
  }

  /** Set the stand (cradle) configuration */
  async setStandConfig(config: StandConfig): Promise<void> {
    return this._set(CapturePropertyIds.StandConfigDevice, CapturePropertyTypes.Ulong, config);
  }

  /**
   * Get the device timers.
   * Returns: { triggerLockTimer, connectedPowerOffTimer, disconnectedPowerOffTimer }
   * Times are in milliseconds (power timers) and 1/4 seconds (trigger lock timer).
   */
  async getTimers(): Promise<{
    triggerLockTimer: number;
    connectedPowerOffTimer: number;
    disconnectedPowerOffTimer: number;
  }> {
    return this._get(CapturePropertyIds.TimersDevice);
  }

  /**
   * Set the device timers.
   * @param mask - Which timers to apply (see Timer enum flags)
   * @param connectedPowerOffTimer - Milliseconds before powering off when connected
   * @param disconnectedPowerOffTimer - Milliseconds before powering off when disconnected
   * @param triggerLockTimer - 1/4 seconds before locking trigger (used with app data confirmation)
   */
  async setTimers(
    mask: Timer,
    connectedPowerOffTimer: number,
    disconnectedPowerOffTimer: number,
    triggerLockTimer: number
  ): Promise<void> {
    return this._set(CapturePropertyIds.TimersDevice, CapturePropertyTypes.Array, {
      mask,
      connectedPowerOffTimer,
      disconnectedPowerOffTimer,
      triggerLockTimer,
    });
  }

  // ─── BLE Device Lifecycle ──────────────────────────────────────────────────

  /** Disconnect the BLE device (makes it available for reconnect) */
  async setDisconnect(): Promise<void> {
    return this._set(
      CapturePropertyIds.DisconnectDevice,
      CapturePropertyTypes.Byte,
      Disconnect.MakeAvailable
    );
  }

  /** Factory reset the device */
  async setFactoryReset(): Promise<void> {
    return this._set(CapturePropertyIds.RestoreFactoryDefaultsDevice, CapturePropertyTypes.None, {});
  }

  /** Power cycle (reset) the device. If on power, it reboots; otherwise it powers off. */
  async setReset(): Promise<void> {
    return this._set(CapturePropertyIds.ResetDevice, CapturePropertyTypes.None, {});
  }

  /** Power off the device */
  async setPowerOff(): Promise<void> {
    return this._set(CapturePropertyIds.SetPowerOffDevice, CapturePropertyTypes.None, {});
  }
}
