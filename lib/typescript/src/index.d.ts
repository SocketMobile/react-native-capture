import SocketCamViewContainer from './components/SocketCamViewContainer';
import { Capture, SktErrors, CapturePropertyIds, CapturePropertyTypes, CaptureProperty, CaptureEventIds, CaptureEventTypes, CaptureEvent, CaptureDeviceType, CaptureDataSourceID, CaptureDataSourceFlags, CaptureDataSourceStatus, DataConfirmationMode, DeviceDataAcknowledgment, SecurityMode, Trigger, DeletePairing, SoundActionType, SoundFrequency, RumbleActionType, LocalDecodeAction, DataConfirmationLed, DataConfirmationBeep, DataConfirmationRumble, Flash, PowerState, MonitorDbg, Counter, Disconnect, ProfileSelect, ProfileConfig, Timer, DataFormat, TriggerMode, ConnectReason, StartUpRoleSpp, ConnectBeepConfig, StandConfig, type AppInfo, JRpcError, type DeviceInfo, SocketCam, type Logger } from 'socketmobile-capturejs';
import CaptureHelper from './CaptureHelper';
declare const CaptureSdk: any;
declare type Notification = (event: CaptureEvent<any>, handle?: number) => void;
interface AppInfoRn {
    appIdIos?: string;
    appKeyIos?: string;
    developerId: string;
    appIdAndroid?: string;
    appKeyAndroid?: string;
    appId?: string;
    appKey?: string;
}
interface DeviceGuidMap {
    [key: string]: string;
}
interface DecodedData {
    name: string;
    length: number;
    data: any;
    id?: number;
}
interface ExtensionEventData {
    status: number;
    message: string;
}
interface SocketLogger extends Logger {
    log: (message: string, arg?: string | object) => void;
    error: (message: string, arg?: string | object) => void;
}
declare const SocketCamTypes: number[];
declare const BluetoothLEDeviceTypes: number[];
declare class CaptureRn extends Capture {
    logger?: SocketLogger;
    constructor(logger?: SocketLogger);
    openForAndroid(tries: number, appInfo: AppInfo, callback: Notification, options: any): Promise<number>;
    open(appInfo: AppInfoRn, callback: Notification, options?: any): Promise<number>;
}
declare const CaptureArchitectureInfo: {
    isUsingNewArchitecture: () => boolean;
    isUsingTurboModule: () => boolean;
    getArchitectureInfo: () => {
        architecture: string;
        usingTurboModule: boolean;
        usingBridge: boolean;
        moduleType: string;
        platform: "ios" | "android" | "windows" | "macos" | "web";
        reactNativeVersion: {
            major: number;
            minor: number;
            patch: number;
            prerelease?: string | null | undefined;
        };
    };
    logArchitectureInfo: () => {
        architecture: string;
        usingTurboModule: boolean;
        usingBridge: boolean;
        moduleType: string;
        platform: "ios" | "android" | "windows" | "macos" | "web";
        reactNativeVersion: {
            major: number;
            minor: number;
            patch: number;
            prerelease?: string | null | undefined;
        };
    };
};
interface CaptureDeviceInfo extends CaptureRn {
    guid: string;
    name: string;
    type: number;
    handle: number;
    devCapture: CaptureRn;
}
export { CaptureRn, SktErrors, CapturePropertyIds, CapturePropertyTypes, CaptureProperty, CaptureEventIds, CaptureEventTypes, CaptureEvent, CaptureDeviceType, CaptureDataSourceID, CaptureDataSourceFlags, CaptureDataSourceStatus, DataConfirmationMode, DeviceDataAcknowledgment, SecurityMode, Trigger, DeletePairing, SoundActionType, SoundFrequency, RumbleActionType, LocalDecodeAction, DataConfirmationLed, DataConfirmationBeep, DataConfirmationRumble, Flash, PowerState, MonitorDbg, Counter, Disconnect, ProfileSelect, ProfileConfig, Timer, DataFormat, TriggerMode, ConnectReason, StartUpRoleSpp, ConnectBeepConfig, StandConfig, JRpcError, SocketCam, SocketCamTypes, BluetoothLEDeviceTypes, SocketCamViewContainer, CaptureSdk, // Native Modules
CaptureHelper, CaptureArchitectureInfo, };
export type { Notification, DeviceInfo, AppInfoRn, DeviceGuidMap, DecodedData, ExtensionEventData, CaptureDeviceInfo, SocketLogger, };
//# sourceMappingURL=index.d.ts.map