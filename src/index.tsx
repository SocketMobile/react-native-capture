import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import NativeCaptureSdk from './NativeCaptureSdk';

import SocketCamViewContainer from './components/SocketCamViewContainer';

import {
  Capture,
  SktErrors,
  CapturePropertyIds,
  CapturePropertyTypes,
  CaptureProperty,
  CaptureEventIds,
  CaptureEventTypes,
  CaptureEvent,
  CaptureDeviceType,
  CaptureDataSourceID,
  CaptureDataSourceFlags,
  CaptureDataSourceStatus,
  DataConfirmationMode,
  DeviceDataAcknowledgment,
  SecurityMode,
  Trigger,
  DeletePairing,
  SoundActionType,
  SoundFrequency,
  RumbleActionType,
  LocalDecodeAction,
  DataConfirmationLed,
  DataConfirmationBeep,
  DataConfirmationRumble,
  Flash,
  PowerState,
  MonitorDbg,
  Counter,
  Disconnect,
  ProfileSelect,
  ProfileConfig,
  Timer,
  DataFormat,
  TriggerMode,
  ConnectReason,
  StartUpRoleSpp,
  ConnectBeepConfig,
  StandConfig,
  type AppInfo,
  JRpcError,
  JRpcResponse,
  JsonRpc,
  type DeviceInfo,
  SocketCam,
  type Logger,
} from 'socketmobile-capturejs';

import CaptureHelper from './CaptureHelper';

const LINKING_ERROR =
  `The package 'react-native-capture' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// Use TurboModule for new architecture, fallback to legacy for old architecture
const CaptureSdk = (() => {
  // Try to get TurboModule first (new architecture)
  if (NativeCaptureSdk) {
    console.log('CaptureSdk: Using NEW ARCHITECTURE (TurboModule) ✅');
    return NativeCaptureSdk;
  }
  
  // Fallback to legacy bridge module (old architecture)
  if (NativeModules.CaptureSdk) {
    console.log('⚠️  CaptureSdk: Using LEGACY ARCHITECTURE (Bridge)');
    return NativeModules.CaptureSdk;
  }
  
  // If neither is available, return proxy that throws linking error
  console.error('CaptureSdk: No module found - check linking');
  return new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );
})();

declare type Notification = (event: CaptureEvent<any>, handle?: number) => void;

// exporting React Native Specific AppInfo interface in order to use the new properties in a typestrict way
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

const noLogger = {
  log: () => {},
  error: () => {},
};

const SocketCamTypes = [
  CaptureDeviceType.SocketCamC820,
  CaptureDeviceType.SocketCamC860,
];

const BluetoothLEDeviceTypes = [
  CaptureDeviceType.ScannerS320,
  CaptureDeviceType.ScannerS370,
  CaptureDeviceType.ScannerS550,
];

const onCaptureEvent = (e: CaptureEvent<string>) => {
  // maybe need to access handle here but this one doesn't get called in Android.
  console.log('index onCaptureEvent <= ', e);
  const event = JSON.parse(e.toString());
  if (CaptureSdk.onNotification) {
    CaptureSdk.onNotification(event);
  }
};

// Create event emitter with proper fallback handling
let captureEventEmitter: NativeEventEmitter;
let subscription: any;

try {
  // For new architecture, events are handled differently
  if (NativeCaptureSdk) {
    captureEventEmitter = new NativeEventEmitter(CaptureSdk as any);
  } else {
    captureEventEmitter = new NativeEventEmitter(CaptureSdk);
  }
  
  subscription = captureEventEmitter.addListener(
    'onCaptureEvent',
    onCaptureEvent
  );
} catch (error) {
  console.warn('Failed to create event emitter for CaptureSdk:', error);
  // Create a dummy subscription that can be safely removed
  subscription = { remove: () => {} };
}

// Extend CaptureSdk with legacy compatibility methods
if (!CaptureSdk.open) {
  (CaptureSdk as any).open = (host: String, notification: Function) => {
    (CaptureSdk as any).onNotification = notification;
    return CaptureSdk.openTransport(host).then((result: any) => result.transport);
  };
}

if (!CaptureSdk.send) {
  (CaptureSdk as any).send = (handle: number, jsonRpc: JsonRpc) => {
    console.log('=> ', jsonRpc);
    return CaptureSdk.sendTransport(handle, JSON.stringify(jsonRpc)).then(
      (response: JRpcResponse<any>) => {
        console.log('<= ', response);
        return JSON.parse(response.toString());
      }
    );
  };
}

if (!CaptureSdk.close) {
  (CaptureSdk as any).close = (handle: number) => {
    subscription.remove();
    return CaptureSdk.closeTransport(handle);
  };
}

const getOptions = (
  platform: Platform,
  options: any,
  logger?: SocketLogger
) => {
  const final = options || {};
  if (platform.OS === 'ios') {
    // Set logger if CaptureSdk supports it (legacy compatibility)
    if (CaptureSdk && typeof CaptureSdk === 'object') {
      (CaptureSdk as any).logger = logger || noLogger;
    }
    final.transport = CaptureSdk;
  } else {
    // Start capture service for Android
    if (CaptureSdk.startCaptureService) {
      CaptureSdk.startCaptureService();
    }
  }
  return final;
};

class CaptureRn extends Capture {
  logger?: SocketLogger;
  constructor(logger?: SocketLogger) {
    super(logger);
    this.logger = logger;
  }

  openForAndroid(
    tries: number,
    appInfo: AppInfo,
    callback: Notification,
    options: any
  ): Promise<number> {
    return new Promise((resolve: Function, reject: Function) => {
      let interval: ReturnType<typeof setTimeout> | undefined;
      const openRetry = () => {
        clearInterval(interval);
        super
          .open(appInfo, callback, options)
          .then((result: number) => resolve(result))
          .catch((err: JRpcError) => {
            console.log('android retry error: ', err);
            if (tries > 0) {
              tries -= 1;
              interval = setInterval(openRetry, 250);
            } else {
              reject(err);
            }
          });
      };
      interval = setInterval(openRetry, 250);
    });
  }

  open(appInfo: AppInfoRn, callback: Notification, options?: any) {
    const finalOptions = getOptions(Platform, options, this.logger);
    if (Platform.OS === 'android') {
      let newAppInfo = genAppInfo(appInfo, true);
      return this.openForAndroid(10, newAppInfo, callback, options);
    }
    let newAppInfo = genAppInfo(appInfo, false);
    return super.open(newAppInfo, callback, finalOptions);
  }
}

const genAppInfo = (appInfo: AppInfoRn, isAndroid: boolean) => {
  const appId = isAndroid ? appInfo.appIdAndroid : appInfo.appIdIos;
  const appKey = isAndroid ? appInfo.appKeyAndroid : appInfo.appKeyIos;

  return {
    ...appInfo,
    appId: appId || appInfo.appId,
    appKey: appKey || appInfo.appKey,
  } as AppInfo;
};

// Architecture detection utility
const CaptureArchitectureInfo = {
  isUsingNewArchitecture: () => {
    return !!NativeCaptureSdk;
  },
  
  isUsingTurboModule: () => {
    return !!NativeCaptureSdk;
  },
  
  getArchitectureInfo: () => {
    const isNewArch = !!NativeCaptureSdk;
    const hasLegacyModule = !!NativeModules.CaptureSdk;
    
    return {
      architecture: isNewArch ? 'new' : 'legacy',
      usingTurboModule: isNewArch,
      usingBridge: !isNewArch && hasLegacyModule,
      moduleType: isNewArch ? 'TurboModule' : 'Bridge',
      platform: Platform.OS,
      reactNativeVersion: Platform.constants.reactNativeVersion,
    };
  },
  
  logArchitectureInfo: () => {
    const info = CaptureArchitectureInfo.getArchitectureInfo();
    console.log('CaptureSdk Architecture Info:', info);
    return info;
  },
};

// interface to more easily identify device captures from root captures
// and allow device captures to contain device info useful in UI, such as
// identifying different devices in a list, rendering device names, etc.
interface CaptureDeviceInfo extends CaptureRn {
  guid: string;
  name: string;
  type: number;
  handle: number;
  devCapture: CaptureRn;
}

export {
  CaptureRn,
  SktErrors,
  CapturePropertyIds,
  CapturePropertyTypes,
  CaptureProperty,
  CaptureEventIds,
  CaptureEventTypes,
  CaptureEvent,
  CaptureDeviceType,
  CaptureDataSourceID,
  CaptureDataSourceFlags,
  CaptureDataSourceStatus,
  DataConfirmationMode,
  DeviceDataAcknowledgment,
  SecurityMode,
  Trigger,
  DeletePairing,
  SoundActionType,
  SoundFrequency,
  RumbleActionType,
  LocalDecodeAction,
  DataConfirmationLed,
  DataConfirmationBeep,
  DataConfirmationRumble,
  Flash,
  PowerState,
  MonitorDbg,
  Counter,
  Disconnect,
  ProfileSelect,
  ProfileConfig,
  Timer,
  DataFormat,
  TriggerMode,
  ConnectReason,
  StartUpRoleSpp,
  ConnectBeepConfig,
  StandConfig,
  JRpcError,
  SocketCam,
  SocketCamTypes,
  BluetoothLEDeviceTypes,
  SocketCamViewContainer,
  CaptureSdk, // Native Modules
  // These are the helper methods for the Developer (currently pertains to SocketCam helpers only).
  CaptureHelper,
  // Architecture detection utility
  CaptureArchitectureInfo,
};

export type {
  Notification,
  DeviceInfo,
  AppInfoRn,
  DeviceGuidMap,
  DecodedData,
  ExtensionEventData,
  CaptureDeviceInfo,
  SocketLogger,
};
