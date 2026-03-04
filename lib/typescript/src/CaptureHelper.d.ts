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
    /** Get the CaptureSDK version */
    getVersion(): Promise<{
        major: number;
        minor: number;
        build: number;
    }>;
    /**
     * Show or hide the SocketCam symbology selector menu.
     * When disabled, the end user cannot change enabled symbologies from the SocketCam view.
     */
    setSocketCamSymbologySelectorDisabled(disabled: boolean): Promise<void>;
    /** Get the current SocketCam enabled/disabled status as a raw byte value */
    getSocketCamEnabled(): Promise<any>;
    /**
     * Enable or disable the SocketCam virtual device (Android + iOS).
     * When enabled, a DeviceArrival event fires for the SocketCam device.
     * When disabled, a DeviceRemoval event fires.
     *
     * Android note: enabling requires the SocketCam extension APK to be installed.
     */
    setSocketCamEnabled(enabled: boolean): Promise<void>;
    /**
     * Start BLE discovery or launch the iOS Bluetooth Classic picker.
     * Listen for discovered devices via the onDiscoveredDevice callback.
     * When discovery ends, onDiscoveryEnd is called.
     *
     * @param mode - 1 for Bluetooth LE, 2 for Bluetooth Classic
     */
    addBluetoothDevice(mode: BluetoothDiscoveryMode): Promise<void>;
    /**
     * Connect to a BLE device found during discovery.
     * Requires DeviceManagerArrival to have fired (BLE device manager must be available).
     * On success, onDeviceArrival will fire with the connected CaptureHelperDevice.
     */
    connectDiscoveredDevice(device: DiscoveredDeviceInfo): Promise<void>;
    /**
     * Remove a connected BLE discovered device.
     *
     * The device's native CaptureSDK handle is closed in the subsequent DeviceRemoval
     * event handler, not here — closing before the SDK disconnect corrupts SDK state.
     */
    removeBleDevice(device: CaptureHelperDevice): Promise<void>;
    /** Disconnect from a connected BLE device (by its discovered device info) */
    disconnectFromDiscoveredDevice(device: DiscoveredDeviceInfo): Promise<void>;
    /**
     * Get the unique identifier string for a BLE device from its GUID.
     * Useful for building persistent device associations.
     */
    getDeviceUniqueIdentifier(deviceGuid: string): Promise<string>;
}
export default CaptureHelper;
//# sourceMappingURL=CaptureHelper.d.ts.map