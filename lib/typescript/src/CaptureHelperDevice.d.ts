import { CaptureProperty, CaptureDataSourceStatus, type Trigger, type DataFormat, type StandConfig, type LocalDecodeAction, type DeviceDataAcknowledgment, type DataConfirmationLed, type DataConfirmationBeep, type DataConfirmationRumble, type Notifications, type PowerState, type Timer } from 'socketmobile-capturejs';
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
export declare class CaptureHelperDevice {
    readonly name: string;
    readonly guid: string;
    readonly type: number;
    readonly handle: number;
    /**
     * The underlying device capture — exposed for SocketCam component compatibility.
     * Prefer using the typed methods on this class instead of calling devCapture directly.
     */
    readonly devCapture: CaptureAPI;
    constructor(info: CaptureHelperDeviceInfo, capture: CaptureRn);
    /** Multi-interface device families: each physical device appears as multiple virtual devices */
    private static readonly _multiInterfaceFamilies;
    /**
     * Returns the multi-interface family (array of device types) that the given
     * device type belongs to, or undefined if it is a single-interface device.
     */
    static getMultiInterfaceFamily(deviceType: number): number[] | undefined;
    private static readonly _bluetoothLowEnergyDeviceTypes;
    private _isBluetoothLowEnergy;
    private static _decodeBleTimer;
    private static _encodeBleTimer;
    private _get;
    private _set;
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
    getFriendlyName(): Promise<string>;
    /**
     * Set the device's friendly name.
     * The friendly name is the name that appears in Bluetooth settings.
     *
     * @param name - The new friendly name (max 31 UTF-8 characters)
     */
    setFriendlyName(name: string): Promise<void>;
    /**
     * Get the Bluetooth address of the device.
     *
     * @returns The Bluetooth MAC address as a 6-byte array
     */
    getBluetoothAddress(): Promise<number[]>;
    /**
     * Get the model of the device (see `CaptureDeviceType` enum).
     *
     * Tip: You can also read `device.type` directly to avoid an async call,
     * but that value is only set at connection time.
     *
     * @returns A `CaptureDeviceType` value identifying the device model
     */
    getDeviceType(): Promise<number>;
    /**
     * Get the firmware version of the device.
     *
     * @returns An object with version components: `major`, `middle`, `minor`, `build`,
     * and optionally `year`, `month`, `day` for the firmware build date
     */
    getFirmwareVersion(): Promise<{
        major: number;
        middle: number;
        minor: number;
        build: number;
        year?: number;
        month?: number;
        day?: number;
    }>;
    /**
     * Get the current battery level of the device.
     *
     * Tip: Consider using {@link CaptureHelper} `onBatteryLevel` callback with
     * `setNotifications` to subscribe to battery level change events instead of polling.
     *
     * @returns Battery percentage (0–100)
     */
    getBatteryLevel(): Promise<number>;
    /**
     * Get the current power state of the device (on battery, on cradle, on AC, etc.).
     *
     * Tip: Consider using {@link CaptureHelper} `onPowerState` callback with
     * `setNotifications` to subscribe to power state events instead of polling.
     *
     * @returns A `PowerState` value
     */
    getPowerState(): Promise<PowerState>;
    /**
     * Get the current state of each button on the device (pressed/released).
     *
     * Tip: Consider using {@link CaptureHelper} `onButtons` callback with
     * `setNotifications` to subscribe to button press/release events instead of polling.
     *
     * @returns A `Notifications` bitmask describing the button states
     */
    getButtonsState(): Promise<Notifications>;
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
    setTrigger(trigger: Trigger): Promise<void>;
    /**
     * Get the status of a data source (symbology or NFC tag type).
     * A data source describes a barcode symbology (e.g. EAN-13, QR Code) or
     * an NFC tag type that the device can decode.
     *
     * @param dataSourceId - A `CaptureDataSourceID` constant identifying the symbology or tag type
     * @returns An object with `id`, `name`, and `status` (`CaptureDataSourceStatus.Enabled` or `Disabled`)
     */
    getDataSource(dataSourceId: number): Promise<{
        id: number;
        name: string;
        status: CaptureDataSourceStatus;
    }>;
    /**
     * Enable or disable a data source (symbology or NFC tag type) on the device.
     *
     * @param dataSourceId - A `CaptureDataSourceID` constant identifying the symbology or tag type
     * @param status - `CaptureDataSourceStatus.Enabled` or `CaptureDataSourceStatus.Disabled`
     */
    setDataSource(dataSourceId: number, status: CaptureDataSourceStatus): Promise<void>;
    /**
     * Get the local decode action of the device.
     * The decode action determines how decoded data is acknowledged locally —
     * with a beep, rumble, flash, or some combination of all three.
     *
     * @returns A `LocalDecodeAction` bitmask value
     */
    getDecodeAction(): Promise<LocalDecodeAction>;
    /**
     * Set the local decode action of the device.
     * Controls the beep, rumble, and/or flash feedback when data is decoded.
     *
     * @param action - A `LocalDecodeAction` bitmask combining the desired feedback
     */
    setDecodeAction(action: LocalDecodeAction): Promise<void>;
    /**
     * Get the local device acknowledgment mode.
     * When enabled, the device acknowledges decoded data as soon as it is decoded.
     * When disabled, the device waits for the host to acknowledge decoded data and
     * the trigger will be locked until acknowledgment is received or the trigger lock
     * timeout has elapsed.
     *
     * @returns A `DeviceDataAcknowledgment` value
     */
    getDataAcknowledgment(): Promise<DeviceDataAcknowledgment>;
    /**
     * Set the local device acknowledgment mode.
     * When enabled, the device acknowledges decoded data immediately.
     * When disabled, the device waits for the host to acknowledge via
     * {@link setDataConfirmation} and the trigger locks until acknowledgment
     * is received or the trigger lock timeout elapses.
     *
     * @param mode - A `DeviceDataAcknowledgment` value (`On` or `Off`)
     */
    setDataAcknowledgment(mode: DeviceDataAcknowledgment): Promise<void>;
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
    setDataConfirmation(led: DataConfirmationLed, beep: DataConfirmationBeep, rumble: DataConfirmationRumble): Promise<void>;
    /**
     * Get the current notification subscriptions for the device.
     * Notifications allow subscribing to events such as trigger press/release,
     * power button press/release, power state change, and battery level change.
     *
     * @returns A `Notifications` bitmask of the currently subscribed events
     */
    getNotifications(): Promise<Notifications>;
    /**
     * Set which events the device reports to the host.
     * Subscribable events include trigger press/release, power button press/release,
     * power state change, and battery level change.
     *
     * @param flags - A `Notifications` bitmask combining the desired event subscriptions.
     *   Example: `Notifications.BatteryLevelChange | Notifications.PowerState`
     */
    setNotifications(flags: Notifications): Promise<void>;
    /**
     * Get the decoded data format of the device.
     * The data format controls how scanned data is structured in the `onDecodedData` callback.
     *
     * @returns A `DataFormat` value (e.g. `DataFormat.Raw`, `DataFormat.TagTypeAndData`)
     */
    getDataFormat(): Promise<DataFormat>;
    /**
     * Set the decoded data format of the device.
     * For NFC devices, use `DataFormat.TagTypeAndData` to receive both the tag type
     * and the payload in the `onDecodedData` callback.
     *
     * @param format - A `DataFormat` value
     */
    setDataFormat(format: DataFormat): Promise<void>;
    /**
     * Send an arbitrary get command to the device and receive the response.
     * This is a low-level API for sending proprietary commands that are not
     * exposed as typed methods. Use only when you know the device's command set.
     *
     * @param command - A byte array containing the raw command to send
     * @returns The device's raw response as a byte array
     */
    getDeviceSpecificCommand(command: number[]): Promise<number[]>;
    /**
     * Get the stand (cradle) configuration of the device.
     * Controls the scanning behavior when the device is placed in a stand/cradle.
     *
     * @returns A `StandConfig` value
     */
    getStandConfig(): Promise<StandConfig>;
    /**
     * Set the stand (cradle) configuration of the device.
     * Controls whether the device auto-scans when placed in a stand.
     *
     * @param config - A `StandConfig` value (e.g. `StandConfig.DetectMode`, `StandConfig.MobileMode`)
     */
    setStandConfig(config: StandConfig): Promise<void>;
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
    getTimers(): Promise<{
        mask: number;
        triggerLockTimer: number;
        connectedPowerOffTimer: number;
        disconnectedPowerOffTimer: number;
    }>;
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
    setTimers(mask: Timer, connectedPowerOffTimer: number, disconnectedPowerOffTimer: number, triggerLockTimer: number): Promise<void>;
    /**
     * Instruct the device to drop its Bluetooth connection.
     * The device becomes available for reconnection.
     *
     * Note: After sending this command, the host will be unable to send any
     * subsequent commands to this device until it reconnects.
     */
    setDisconnect(): Promise<void>;
    /**
     * Reset all the settings on the device to their factory default values.
     * This includes symbology settings, preamble, postamble, friendly name, timers, etc.
     */
    setFactoryReset(): Promise<void>;
    /**
     * Power cycle a Bluetooth LE device.
     * When the device is on a power source (e.g. charging), it reboots.
     * Otherwise it simply powers off.
     */
    setReset(): Promise<void>;
    /**
     * Turn the device off.
     * The device will need to be manually powered on again to reconnect.
     */
    setPowerOff(): Promise<void>;
}
export {};
//# sourceMappingURL=CaptureHelperDevice.d.ts.map