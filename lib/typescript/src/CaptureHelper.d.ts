import { type PowerState, type Notifications, type DiscoveredDeviceInfo } from 'socketmobile-capturejs';
import { CaptureRn, type AppInfoRn, type DecodedData, type BluetoothDiscoveryMode } from 'react-native-capture';
import { CaptureHelperDevice } from './CaptureHelperDevice';
export type { CaptureHelperDevice };
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
    onError?: (error: {
        code: number;
        message: string;
    }) => void;
    /** Called when the SDK emits a log trace (requires setLogger before open) */
    onLogTrace?: (trace: string) => void;
}
export interface CaptureHelperOptions extends CaptureHelperCallbacks {
    appInfo: AppInfoRn;
}
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
export declare class CaptureHelper {
    private _capture;
    private _bleDeviceManager;
    /**
     * Devices keyed by handle.
     * The handle at DeviceArrival equals the handle used for subsequent device events
     * (DecodedData, BatteryLevel, etc.) from that device.
     */
    private _devices;
    /**
     * Maps device GUID → iOS BLE identifierUuid for devices connected via
     * connectDiscoveredDevice. Required for DisconnectDiscoveredDevice.
     */
    private _bleIdentifiers;
    /**
     * Holds the identifierUuid of the device being connected via
     * connectDiscoveredDevice, until DeviceArrival provides the GUID to map it.
     */
    private _pendingIdentifierUuid;
    private _appInfo;
    private _callbacks;
    constructor(options: CaptureHelperOptions);
    /**
     * Open the CaptureSDK. Must be called before any other method.
     * Call once per app session — typically in a top-level useEffect or componentDidMount.
     */
    open(): Promise<void>;
    /**
     * Close the CaptureSDK and release all resources.
     * Call in componentWillUnmount or when the app goes to background.
     * We do not recommend closing and reopening the SDK multiple times per session,
     * but this method can be called followed by open() to restart the SDK if needed.
     * The transition of the app from foreground to background does not affect the SDK state, so open() only needs to be called once per session unless you want to explicitly restart the SDK with close() followed by open().
     * After calling close(), the CaptureHelper instance cannot be used until open() is called again.
     */
    close(): Promise<void>;
    /** Returns the list of currently connected devices */
    getDevices(): CaptureHelperDevice[];
    /**
     * The root CaptureRn instance.
     * Needed when passing `socketCamCapture` to SocketCamViewContainer,
     * which reads the Capture-level SocketCamStatus property from it.
     */
    get rootCapture(): CaptureRn | null;
    private _findDeviceByGuid;
    private _handleCaptureEvent;
    private _get;
    private _set;
    private _setBle;
    private _getBle;
    /**
     * Get the Capture service version.
     *
     * @returns An object with `major`, `minor`, and `build` version numbers
     */
    getVersion(): Promise<{
        major: number;
        minor: number;
        build: number;
    }>;
    /**
     * Set the Capture configuration to show or hide the SocketCam symbology selector menu.
     * When disabled, the end user cannot change which symbologies are enabled
     * from the SocketCam camera view.
     *
     * @param disabled - `true` to hide the symbology selector, `false` to show it
     */
    setSocketCamSymbologySelectorDisabled(disabled: boolean): Promise<void>;
    /**
     * Get the current SocketCam status (enabled or disabled).
     *
     * @returns A `SocketCam` value (`SocketCam.Enable` or `SocketCam.Disable`)
     */
    getSocketCamEnabled(): Promise<any>;
    /**
     * Enable or disable the SocketCam virtual device.
     * SocketCam uses the device's built-in camera as a barcode scanner.
     *
     * When enabled, an `onDeviceArrival` event fires for the SocketCam device.
     * When disabled, an `onDeviceRemoval` event fires.
     *
     * Note (Android): Enabling requires the SocketCam extension to be installed.
     *
     * @param enabled - `true` to enable SocketCam, `false` to disable it
     */
    setSocketCamEnabled(enabled: boolean): Promise<void>;
    /**
     * Add a Bluetooth device by starting BLE discovery or launching the
     * iOS Bluetooth Classic picker.
     *
     * Listen for discovered devices via the `onDiscoveredDevice` callback.
     * When discovery ends, `onDiscoveryEnd` is called.
     *
     * @param mode - A `BluetoothDiscoveryMode` value:
     *   - `1` — Bluetooth Low Energy (BLE) discovery
     *   - `2` — Bluetooth Classic
     */
    addBluetoothDevice(mode: BluetoothDiscoveryMode): Promise<void>;
    /**
     * Connect to a BLE device found during discovery via the Device Manager.
     * Requires `DeviceManagerArrival` to have fired (the BLE device manager
     * must be available).
     *
     * On success, `onDeviceArrival` fires with the connected `CaptureHelperDevice`.
     *
     * @param device - The `DiscoveredDeviceInfo` received from the `onDiscoveredDevice` callback
     */
    connectDiscoveredDevice(device: DiscoveredDeviceInfo): Promise<void>;
    /**
     * Remove a Bluetooth device (Classic or Low Energy).
     * This unpairs the device from the host. A `DeviceRemoval` event fires when complete.
     *
     * The device's native CaptureSDK handle is closed in the subsequent `onDeviceRemoval`
     * callback, not here — closing before the SDK disconnect would corrupt SDK state.
     *
     * @param device - The `CaptureHelperDevice` to remove
     */
    removeBleDevice(device: CaptureHelperDevice): Promise<void>;
    /**
     * Disconnect from a BLE device that was connected via {@link connectDiscoveredDevice}.
     * Uses the Device Manager to drop the connection.
     *
     * @param device - The `DiscoveredDeviceInfo` identifying the device to disconnect
     */
    disconnectFromDiscoveredDevice(device: DiscoveredDeviceInfo): Promise<void>;
    /**
     * Get the BLE unique device identifier that can be used to set a device as favorite.
     * Useful for building persistent device associations across sessions.
     *
     * @param deviceGuid - The GUID of the device (from `CaptureHelperDevice.guid`)
     * @returns A unique identifier string for the BLE device
     */
    getDeviceUniqueIdentifier(deviceGuid: string): Promise<string>;
}
export default CaptureHelper;
//# sourceMappingURL=CaptureHelper.d.ts.map