/* eslint-disable no-bitwise */
// src/CaptureHelperDevice.ts
import {
  CaptureDeviceType,
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
 * Functions a device can support (barcode scanner, NFC reader, NFC writer).
 * Matches `SKTCaptureDeviceFunction` (iOS) — encoded in bits 8–13 of the device type.
 * Not yet exported from socketmobile-capturejs main entry — defined here for SDK consumers.
 */
export enum CaptureDeviceTypeFunction {
  Legacy = 0,
  Scanner = 1,
  NFCReader = 2,
  NFCWriter = 4,
  Unknown = 8,
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

  /** Multi-interface device families: each physical device appears as multiple virtual devices */
  private static readonly _multiInterfaceFamilies: number[][] = [
    [CaptureDeviceType.ScannerS370, CaptureDeviceType.NFCS370],
  ];

  /**
   * Returns the multi-interface family (array of device types) that the given
   * device type belongs to, or undefined if it is a single-interface device.
   */
  static getMultiInterfaceFamily(deviceType: number): number[] | undefined {
    return CaptureHelperDevice._multiInterfaceFamilies.find(
      family => family.includes(deviceType)
    );
  }

  // ─── BLE timer device categories ────────────────────────────────────────────

  private static readonly _bluetoothLowEnergyDeviceTypes: number[] = [
    CaptureDeviceType.ScannerS550,
    CaptureDeviceType.DeviceD751,
    CaptureDeviceType.ScannerS370,
    CaptureDeviceType.NFCS370,
    CaptureDeviceType.ScannerS320,
    CaptureDeviceType.DeviceS721,
    CaptureDeviceType.DeviceS741,
  ];

  private _isBluetoothLowEnergy(): boolean {
    return CaptureHelperDevice._bluetoothLowEnergyDeviceTypes.includes(this.type);
  }

  // BLE single-byte timer encoding:
  // 0x00 = disabled, 0x01–0x7F = 1–127 min, 0x80–0xFF = (v & 0x7F) × 15 min
  private static _decodeBleTimer(raw: number): number {
    if (raw & 0x80) {
      return (raw & 0x7F) * 15;
    }
    return raw;
  }

  private static _encodeBleTimer(minutes: number): number {
    if (minutes === 0) return 0x00;
    if (minutes <= 127) return minutes;
    const quarterHours = Math.round(minutes / 15);
    return 0x80 | (Math.min(quarterHours, 0x7F) & 0x7F);
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

  /**
   * Get the device's friendly (display) name.
   * The friendly name is the name that appears in Bluetooth settings.
   *
   * Tip: You can also read `device.name` directly to avoid an async call,
   * but that value is only set at connection time and won't reflect changes
   * made by another app or command barcode.
   *
   * @returns The friendly name string (max 31 UTF-8 characters)
   */
  async getFriendlyName(): Promise<string> {
    return this.name;
  }

  /**
   * Set the device's friendly name.
   * The friendly name is the name that appears in Bluetooth settings.
   *
   * @param name - The new friendly name (max 31 UTF-8 characters)
   */
  async setFriendlyName(name: string): Promise<void> {
    return this._set(CapturePropertyIds.FriendlyNameDevice, CapturePropertyTypes.String, name);
  }

  /**
   * Get the Bluetooth address of the device.
   *
   * @returns The Bluetooth MAC address as a 6-byte array
   */
  async getBluetoothAddress(): Promise<number[]> {
    return this._get(CapturePropertyIds.BluetoothAddressDevice);
  }

  /**
   * Get the model of the device (see `CaptureDeviceType` enum).
   *
   * Tip: You can also read `device.type` directly to avoid an async call,
   * but that value is only set at connection time.
   *
   * @returns A `CaptureDeviceType` value identifying the device model
   */
  async getDeviceType(): Promise<number> {
    return this.type;
  }

  /**
   * Tells if a given device type supports the given functions.
   *
   * @param deviceType - A `CaptureDeviceType` value
   * @param functions - A `CaptureDeviceTypeFunction` bitmask (scanner, NFC reader,
   *   NFC writer, or a combination of several)
   * @returns true if the device supports at least one of the given functions
   */
  static deviceSupportsFunctions(
    deviceType: number,
    functions: CaptureDeviceTypeFunction
  ): boolean {
    let deviceFunction = (deviceType >> 8) & 0x3f;
    if (deviceFunction === CaptureDeviceTypeFunction.Legacy) {
      // Legacy device types don't encode their functions: the D600 and S550
      // are NFC readers/writers, every other legacy device is a barcode scanner.
      if (
        deviceType === CaptureDeviceType.ScannerD600 ||
        deviceType === CaptureDeviceType.NFCS370 ||
        deviceType === CaptureDeviceType.ScannerS550
      ) {
        deviceFunction =
          CaptureDeviceTypeFunction.NFCReader | CaptureDeviceTypeFunction.NFCWriter;
      } else {
        deviceFunction = CaptureDeviceTypeFunction.Scanner;
      }
    }
    return (deviceFunction & functions) !== 0;
  }

  /** Tells if this device is a barcode reader */
  get isBarcodeReader(): boolean {
    return CaptureHelperDevice.deviceSupportsFunctions(
      this.type,
      CaptureDeviceTypeFunction.Scanner
    );
  }

  /** Tells if this device is a NFC reader */
  get isNFCReader(): boolean {
    return CaptureHelperDevice.deviceSupportsFunctions(
      this.type,
      CaptureDeviceTypeFunction.NFCReader
    );
  }

  /**
   * Get the firmware version of the device.
   *
   * @returns An object with version components: `major`, `middle`, `minor`, `build`,
   * and optionally `year`, `month`, `day` for the firmware build date
   */
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

  /**
   * Get the current battery level of the device.
   *
   * Tip: Consider using {@link CaptureHelper} `onBatteryLevel` callback with
   * `setNotifications` to subscribe to battery level change events instead of polling.
   *
   * @returns Battery percentage (0–100)
   */
  async getBatteryLevel(): Promise<number> {
    const raw = await this._get(CapturePropertyIds.BatteryLevelDevice);
    return (raw >> 8) & 0xff;
  }

  /**
   * Get the current power state of the device (on battery, on cradle, on AC, etc.).
   *
   * Tip: Consider using {@link CaptureHelper} `onPowerState` callback with
   * `setNotifications` to subscribe to power state events instead of polling.
   *
   * @returns A `PowerState` value
   */
  async getPowerState(): Promise<PowerState> {
    const raw = await this._get(CapturePropertyIds.PowerStateDevice);
    return raw & 0xff;
  }

  /**
   * Get the current state of each button on the device (pressed/released).
   *
   * Tip: Consider using {@link CaptureHelper} `onButtons` callback with
   * `setNotifications` to subscribe to button press/release events instead of polling.
   *
   * @returns A `Notifications` bitmask describing the button states
   */
  async getButtonsState(): Promise<Notifications> {
    return this._get(CapturePropertyIds.ButtonsStatusDevice);
  }

  // ─── Scan Control ──────────────────────────────────────────────────────────

  /**
   * Set the trigger of the device — can start or stop a read and enable or
   * disable the physical trigger button on the device.
   *
   * @param trigger - One of the `Trigger` values:
   *   - `Trigger.Start` — programmatically fire a scan
   *   - `Trigger.Stop` — abort an ongoing scan
   *   - `Trigger.Enable` — enable the physical trigger button
   *   - `Trigger.Disable` — disable (lock) the physical trigger button
   *   - `Trigger.ContinuousScan` — start continuous scanning mode
   */
  async setTrigger(trigger: Trigger): Promise<void> {
    return this._set(CapturePropertyIds.TriggerDevice, CapturePropertyTypes.Byte, trigger);
  }

  /**
   * Get the status of a data source (symbology or NFC tag type).
   * A data source describes a barcode symbology (e.g. EAN-13, QR Code) or
   * an NFC tag type that the device can decode.
   *
   * @param dataSourceId - A `CaptureDataSourceID` constant identifying the symbology or tag type
   * @returns An object with `id`, `name`, and `status` (`CaptureDataSourceStatus.Enabled` or `Disabled`)
   */
  async getDataSource(dataSourceId: number): Promise<{ id: number; name: string; status: CaptureDataSourceStatus }> {
    return this._get(
      CapturePropertyIds.DataSourceDevice,
      CapturePropertyTypes.DataSource,
      { id: dataSourceId, flags: CaptureDataSourceFlags.Status }
    );
  }

  /**
   * Enable or disable a data source (symbology or NFC tag type) on the device.
   *
   * @param dataSourceId - A `CaptureDataSourceID` constant identifying the symbology or tag type
   * @param status - `CaptureDataSourceStatus.Enabled` or `CaptureDataSourceStatus.Disabled`
   */
  async setDataSource(dataSourceId: number, status: CaptureDataSourceStatus): Promise<void> {
    return this._set(CapturePropertyIds.DataSourceDevice, CapturePropertyTypes.DataSource, 
      { id: dataSourceId, flags: CaptureDataSourceFlags.Status, status: status }
    );
  }

  /**
   * Get the local decode action of the device.
   * The decode action determines how decoded data is acknowledged locally —
   * with a beep, rumble, flash, or some combination of all three.
   *
   * @returns A `LocalDecodeAction` bitmask value
   */
  async getDecodeAction(): Promise<LocalDecodeAction> {
    return this._get(CapturePropertyIds.LocalDecodeActionDevice);
  }

  /**
   * Set the local decode action of the device.
   * Controls the beep, rumble, and/or flash feedback when data is decoded.
   *
   * @param action - A `LocalDecodeAction` bitmask combining the desired feedback
   */
  async setDecodeAction(action: LocalDecodeAction): Promise<void> {
    return this._set(CapturePropertyIds.LocalDecodeActionDevice, CapturePropertyTypes.Byte, action);
  }

  /**
   * Get the local device acknowledgment mode.
   * When enabled, the device acknowledges decoded data as soon as it is decoded.
   * When disabled, the device waits for the host to acknowledge decoded data and
   * the trigger will be locked until acknowledgment is received or the trigger lock
   * timeout has elapsed.
   *
   * @returns A `DeviceDataAcknowledgment` value
   */
  async getDataAcknowledgment(): Promise<DeviceDataAcknowledgment> {
    return this._get(CapturePropertyIds.LocalAcknowledgmentDevice);
  }

  /**
   * Set the local device acknowledgment mode.
   * When enabled, the device acknowledges decoded data immediately.
   * When disabled, the device waits for the host to acknowledge via
   * {@link setDataConfirmation} and the trigger locks until acknowledgment
   * is received or the trigger lock timeout elapses.
   *
   * @param mode - A `DeviceDataAcknowledgment` value (`On` or `Off`)
   */
  async setDataAcknowledgment(mode: DeviceDataAcknowledgment): Promise<void> {
    return this._set(CapturePropertyIds.LocalAcknowledgmentDevice, CapturePropertyTypes.Byte, mode);
  }

  /**
   * Send an acknowledgment to the device. Acknowledgment can either be
   * positive (good scan) or negative (bad scan).
   *
   * Required when `DataConfirmationMode` is set to `ModeApp` on the
   * {@link CaptureHelper} — otherwise the trigger stays locked after a scan.
   * Can also be called at any time to give visual/audio/haptic feedback
   * (e.g. red LED + error beep for an invalid barcode).
   *
   * @param led - LED feedback: `DataConfirmationLed.Green`, `.Red`, or `.None`
   * @param beep - Beep feedback: `DataConfirmationBeep.Good`, `.Bad`, or `.None`
   * @param rumble - Rumble feedback: `DataConfirmationRumble.Good`, `.Bad`, or `.None`
   */
  async setDataConfirmation(
    led: DataConfirmationLed,
    beep: DataConfirmationBeep,
    rumble: DataConfirmationRumble
  ): Promise<void> {
    const value = (rumble << 4) + (beep << 2) + led;
    return this._set(CapturePropertyIds.DataConfirmationDevice, CapturePropertyTypes.Ulong, value);
  }

  /**
   * Get the current notification subscriptions for the device.
   * Notifications allow subscribing to events such as trigger press/release,
   * power button press/release, power state change, and battery level change.
   *
   * @returns A `Notifications` bitmask of the currently subscribed events
   */
  async getNotifications(): Promise<Notifications> {
    return this._get(CapturePropertyIds.NotificationsDevice);
  }

  /**
   * Set which events the device reports to the host.
   * Subscribable events include trigger press/release, power button press/release,
   * power state change, and battery level change.
   *
   * @param flags - A `Notifications` bitmask combining the desired event subscriptions.
   *   Example: `Notifications.BatteryLevelChange | Notifications.PowerState`
   */
  async setNotifications(flags: Notifications): Promise<void> {
    return this._set(CapturePropertyIds.NotificationsDevice, CapturePropertyTypes.Ulong, flags);
  }

  /**
   * Get the decoded data format of the device.
   * The data format controls how scanned data is structured in the `onDecodedData` callback.
   *
   * @returns A `DataFormat` value (e.g. `DataFormat.Raw`, `DataFormat.TagTypeAndData`)
   */
  async getDataFormat(): Promise<DataFormat> {
    return this._get(CapturePropertyIds.DataFormatDevice);
  }

  /**
   * Set the decoded data format of the device.
   * For NFC devices, use `DataFormat.TagTypeAndData` to receive both the tag type
   * and the payload in the `onDecodedData` callback.
   *
   * @param format - A `DataFormat` value
   */
  async setDataFormat(format: DataFormat): Promise<void> {
    return this._set(CapturePropertyIds.DataFormatDevice, CapturePropertyTypes.Byte, format);
  }

  /**
   * Send an arbitrary get command to the device and receive the response.
   * This is a low-level API for sending proprietary commands that are not
   * exposed as typed methods. Use only when you know the device's command set.
   *
   * @param command - A byte array containing the raw command to send
   * @returns The device's raw response as a byte array
   */
  async getDeviceSpecificCommand(command: number[]): Promise<number[]> {
    return this._get(CapturePropertyIds.DeviceSpecific, CapturePropertyTypes.Array, command);
  }

  // ─── Configuration ─────────────────────────────────────────────────────────

  /**
   * Get the stand (cradle) configuration of the device.
   * Controls the scanning behavior when the device is placed in a stand/cradle.
   *
   * @returns A `StandConfig` value
   */
  async getStandConfig(): Promise<StandConfig> {
    return this._get(CapturePropertyIds.StandConfigDevice);
  }

  /**
   * Set the stand (cradle) configuration of the device.
   * Controls whether the device auto-scans when placed in a stand.
   *
   * @param config - A `StandConfig` value (e.g. `StandConfig.DetectMode`, `StandConfig.MobileMode`)
   */
  async setStandConfig(config: StandConfig): Promise<void> {
    return this._set(CapturePropertyIds.StandConfigDevice, CapturePropertyTypes.Ulong, config);
  }

  /**
   * Get the timers for a scanner.
   *
   * Returns the timers for powering off when the device is connected or
   * disconnected without any activity, and the trigger lock timeout used
   * with remote acknowledgment.
   *
   * The byte layout of the response differs by device family:
   * - **Bluetooth Classic**: 8 bytes — mask(2) + triggerLock(2) + disconnected(2) + connected(2)
   * - **Bluetooth LE devices (S550, S370, D751, S721, S741)**: 4 bytes — padding(2) + disconnected(1) + connected(1)
   *
   * For Bluetooth LE devices, the single-byte encoding is:
   * - 0x00 = disabled (always on)
   * - 0x01–0x7F = 1–127 minutes
   * - 0x80–0xFF = (value & 0x7F) × 15 minutes (quarter-hour increments, up to 32 hours)
   *
   * Returned values are always normalized to minutes regardless of device family.
   *
   * @returns An object with:
   *   - `mask` — a `Timer` bitmask indicating which timers are active (0 for BLE devices)
   *   - `triggerLockTimer` — timeout in 1/4 second units for locking the trigger (0 for BLE devices)
   *   - `connectedPowerOffTimer` — timeout in minutes before powering off when connected to a host
   *   - `disconnectedPowerOffTimer` — timeout in minutes before powering off when not connected to any host
   */
  async getTimers(): Promise<{
    mask: number;
    triggerLockTimer: number;
    connectedPowerOffTimer: number;
    disconnectedPowerOffTimer: number;
  }> {
    const data = await this._get(CapturePropertyIds.TimersDevice);
    if (!Array.isArray(data)) {
      throw new Error(`Expected an array for timers, got ${data}`);
    }

    if (this._isBluetoothLowEnergy()) {
      // no mask - disconnected (1 byte) + connected(1 byte)
      if (data.length < 8) {
        throw new Error(`Expected at least 8 bytes for BluetoothLE timers response, got ${data.length}`);
      }
      const disconnectedPowerOffTimer = CaptureHelperDevice._decodeBleTimer(data[6] & 0xFF);
      const connectedPowerOffTimer = CaptureHelperDevice._decodeBleTimer(data[7] & 0xFF);
      return { mask: 0, triggerLockTimer: 0, connectedPowerOffTimer, disconnectedPowerOffTimer };
    }

    // Bluetooth Classic: 8 bytes — mask(2) + triggerLock(2) + disconnected(2) + connected(2)
    if (data.length < 8) {
      throw new Error(`Expected at least 8 bytes for Classic timers, got ${data.length}`);
    }
    const mask = ((data[0] & 0xFF) << 8) | (data[1] & 0xFF);
    const triggerLockTimer = ((data[2] & 0xFF) << 8) | (data[3] & 0xFF);
    const disconnectedPowerOffTimer = ((data[4] & 0xFF) << 8) | (data[5] & 0xFF);
    const connectedPowerOffTimer = ((data[6] & 0xFF) << 8) | (data[7] & 0xFF);
    return { mask, triggerLockTimer, connectedPowerOffTimer, disconnectedPowerOffTimer };
  }

  /**
   * Set the timers for a scanner. The scanner needs to be powered cycle to take effect after setting timers.
   *
   * The byte layout sent to the device differs by device family:
   * - **Bluetooth Classic**: 8 bytes — mask(2) + triggerLock(2) + disconnected(2) + connected(2)
   * - **Bluetooth LE devices (S550, S370, D751, S721, S741)**: 4 bytes — pad(1) + disconnected(1) + pad(1) + connected(1)
   *
   * For Bluetooth Classic, the mask determines which values should be applied.
   * NOTE: on the 700 series (excluding 750) the trigger lock out timer cannot
   * be set at the same time as the connected or disconnected power off timer.
   *
   * For Bluetooth LE devices, the single-byte encoding is:
   * - 0x00 = disabled (always on)
   * - 0x01–0x7F = 1–127 minutes
   * - 0x80–0xFF = (value & 0x7F) × 15 minutes (quarter-hour increments, up to 32 hours)
   *
   * For Bluetooth LE devices, the mask and triggerLockTimer parameters are ignored.
   * All values are in minutes. For Bluetooth LE devices, values >127 min are encoded
   * as quarter-hour increments automatically.
   *
   * @param mask - A `Timer` bitmask selecting which timers to apply (Classic only)
   * @param connectedPowerOffTimer - Timeout in minutes before powering off when connected to a host
   * @param disconnectedPowerOffTimer - Timeout in minutes before powering off when not connected to any host
   * @param triggerLockTimer - Timeout in 1/4 second units for locking the trigger (Classic only)
   */
  async setTimers(
    mask: Timer,
    connectedPowerOffTimer: number,
    disconnectedPowerOffTimer: number,
    triggerLockTimer: number
  ): Promise<void> {
    let data: number[];

    if (this._isBluetoothLowEnergy()) {
      data = [
        0, CaptureHelperDevice._encodeBleTimer(disconnectedPowerOffTimer),
        0, CaptureHelperDevice._encodeBleTimer(connectedPowerOffTimer),
      ];
    } else {
      // Bluetooth Classic
      data = [
        (mask >> 8) & 0xFF, mask & 0xFF,
        (triggerLockTimer >> 8) & 0xFF, triggerLockTimer & 0xFF,
        (disconnectedPowerOffTimer >> 8) & 0xFF, disconnectedPowerOffTimer & 0xFF,
        (connectedPowerOffTimer >> 8) & 0xFF, connectedPowerOffTimer & 0xFF,
      ];
    }

    return this._set(CapturePropertyIds.TimersDevice, CapturePropertyTypes.Array, data);
  }

  // ─── BLE Device Lifecycle ──────────────────────────────────────────────────

  /**
   * Instruct the device to drop its Bluetooth connection.
   * The device becomes available for reconnection.
   *
   * Note: After sending this command, the host will be unable to send any
   * subsequent commands to this device until it reconnects.
   */
  async setDisconnect(): Promise<void> {
    return this._set(
      CapturePropertyIds.DisconnectDevice,
      CapturePropertyTypes.Byte,
      Disconnect.MakeAvailable
    );
  }

  /**
   * Reset all the settings on the device to their factory default values.
   * This includes symbology settings, preamble, postamble, friendly name, timers, etc.
   */
  async setFactoryReset(): Promise<void> {
    return this._set(CapturePropertyIds.RestoreFactoryDefaultsDevice, CapturePropertyTypes.None, {});
  }

  /**
   * Power cycle a Bluetooth LE device.
   * When the device is on a power source (e.g. charging), it reboots.
   * Otherwise it simply powers off.
   */
  async setReset(): Promise<void> {
    return this._set(CapturePropertyIds.ResetDevice, CapturePropertyTypes.None, {});
  }

  /**
   * Turn the device off.
   * The device will need to be manually powered on again to reconnect.
   */
  async setPowerOff(): Promise<void> {
    return this._set(CapturePropertyIds.SetPowerOffDevice, CapturePropertyTypes.None, {});
  }
}
