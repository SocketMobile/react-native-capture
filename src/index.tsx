import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

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

const CaptureSdk = NativeModules.CaptureSdk
  ? NativeModules.CaptureSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

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
  console.log('index onCaptureEvent: ', e);
  console.log('<= ', e);
  const event = JSON.parse(e.toString());
  if (CaptureSdk.onNotification) {
    CaptureSdk.onNotification(event);
  }
};

let captureEventEmitter = new NativeEventEmitter(CaptureSdk);

const subscription = captureEventEmitter.addListener(
  'onCaptureEvent',
  onCaptureEvent
);

CaptureSdk.open = (host: String, notification: Function) => {
  CaptureSdk.onNotification = notification;
  return CaptureSdk.openTransport(host).then((result: any) => result.transport);
};

CaptureSdk.send = (handle: number, jsonRpc: JsonRpc) => {
  console.log('=> ', jsonRpc);
  return CaptureSdk.sendTransport(handle, JSON.stringify(jsonRpc)).then(
    (response: JRpcResponse<any>) => {
      console.log('<= ', response);
      return JSON.parse(response.toString());
    }
  );
};

CaptureSdk.close = (handle: number) => {
  subscription.remove();
  return CaptureSdk.closeTransport(handle);
};

const getOptions = (
  platform: Platform,
  options: any,
  logger?: SocketLogger
) => {
  const final = options || {};
  if (platform.OS === 'ios') {
    CaptureSdk.logger = logger || noLogger;
    final.transport = CaptureSdk;
  } else {
    CaptureSdk.startCaptureService();
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
