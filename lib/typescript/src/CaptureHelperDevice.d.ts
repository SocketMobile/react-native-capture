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
    private _get;
    private _set;
    /** Get the device's friendly (display) name */
    getFriendlyName(): Promise<string>;
    /** Set the device's friendly name. Max 31 UTF-8 characters. */
    setFriendlyName(name: string): Promise<void>;
    /** Get the device's Bluetooth MAC address as a byte array */
    getBluetoothAddress(): Promise<number[]>;
    /** Get the device type (see CaptureDeviceType enum) */
    getDeviceType(): Promise<number>;
    /** Get the device firmware version */
    getFirmwareVersion(): Promise<{
        major: number;
        middle: number;
        minor: number;
        build: number;
        year?: number;
        month?: number;
        day?: number;
    }>;
    /** Get the current battery level (0–100%) */
    getBatteryLevel(): Promise<number>;
    /** Get the current power state (see PowerState enum) */
    getPowerState(): Promise<PowerState>;
    /** Get the current buttons state (see ButtonsState enum) */
    getButtonsState(): Promise<Notifications>;
    /**
     * Set the scan trigger.
     * Use Trigger.Start to fire a scan, Trigger.Stop to abort,
     * Trigger.Enable/Disable to enable or lock the physical button.
     */
    setTrigger(trigger: Trigger): Promise<void>;
    /**
     * Get a data source (symbology or NFC tag type) by ID.
     * Returns an object with { id, name, enabled } describing the current state.
     */
    getDataSource(dataSourceId: number): Promise<{
        id: number;
        name: string;
        status: CaptureDataSourceStatus;
    }>;
    /**
     * Enable or disable a symbology or NFC tag type by ID.
     * Use CaptureDataSourceID constants for the id.
     */
    setDataSource(dataSourceId: number, enabled: CaptureDataSourceStatus): Promise<void>;
    /** Get the local decode action (beep/flash/rumble on good read) */
    getDecodeAction(): Promise<LocalDecodeAction>;
    /** Set the local decode action (see LocalDecodeAction enum) */
    setDecodeAction(action: LocalDecodeAction): Promise<void>;
    /** Get the local data acknowledgment mode (see DeviceDataAcknowledgment enum) */
    getDataAcknowledgment(): Promise<DeviceDataAcknowledgment>;
    /** Set the local data acknowledgment mode */
    setDataAcknowledgment(mode: DeviceDataAcknowledgment): Promise<void>;
    /**
     * Acknowledge decoded data — required when DataConfirmationMode is ModeApp.
     * Can also be called any time to give feedback to the user (e.g. red LED for bad scan).
     */
    setDataConfirmation(led: DataConfirmationLed, beep: DataConfirmationBeep, rumble: DataConfirmationRumble): Promise<void>;
    /** Get the current notification flags (see Notifications enum) */
    getNotifications(): Promise<Notifications>;
    /** Set which events the device reports (battery, power, buttons, etc.) */
    setNotifications(flags: Notifications): Promise<void>;
    /** Get the current data output format (see DataFormat enum) */
    getDataFormat(): Promise<DataFormat>;
    /** Set the data output format (e.g. TagTypeAndData for NFC) */
    setDataFormat(format: DataFormat): Promise<void>;
    /**
     * Send a device-specific raw command and receive the response.
     * Use only when you know the device's proprietary command set.
     */
    getDeviceSpecificCommand(command: number[]): Promise<number[]>;
    /** Get the stand (cradle) configuration (see StandConfig enum) */
    getStandConfig(): Promise<StandConfig>;
    /** Set the stand (cradle) configuration */
    setStandConfig(config: StandConfig): Promise<void>;
    /**
     * Get the device timers.
     * Returns: { triggerLockTimer, connectedPowerOffTimer, disconnectedPowerOffTimer }
     * Times are in milliseconds (power timers) and 1/4 seconds (trigger lock timer).
     */
    getTimers(): Promise<{
        triggerLockTimer: number;
        connectedPowerOffTimer: number;
        disconnectedPowerOffTimer: number;
    }>;
    /**
     * Set the device timers.
     * @param mask - Which timers to apply (see Timer enum flags)
     * @param connectedPowerOffTimer - Milliseconds before powering off when connected
     * @param disconnectedPowerOffTimer - Milliseconds before powering off when disconnected
     * @param triggerLockTimer - 1/4 seconds before locking trigger (used with app data confirmation)
     */
    setTimers(mask: Timer, connectedPowerOffTimer: number, disconnectedPowerOffTimer: number, triggerLockTimer: number): Promise<void>;
    /** Disconnect the BLE device (makes it available for reconnect) */
    setDisconnect(): Promise<void>;
    /** Factory reset the device */
    setFactoryReset(): Promise<void>;
    /** Power cycle (reset) the device. If on power, it reboots; otherwise it powers off. */
    setReset(): Promise<void>;
    /** Power off the device */
    setPowerOff(): Promise<void>;
}
export {};
//# sourceMappingURL=CaptureHelperDevice.d.ts.map