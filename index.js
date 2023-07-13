import { Platform, NativeEventEmitter, NativeModules } from "react-native";
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
  SoftScan,
  PowerState,
  MonitorDbg,
  Counter,
  Disconnect,
  ProfileSelect,
  ProfileConfig,
  Notifications,
  Timer,
  DataFormat,
  TriggerMode,
  ConnectReason,
  StartUpRoleSpp,
  ConnectBeepConfig,
  StandConfig,
} from "socketmobile-capturejs";

const SocketCamTypes = [CaptureDeviceType.SocketCamC820];
const NFCDeviceTypes = [
  CaptureDeviceType.ScannerS370,
  CaptureDeviceType.ScannerS550,
];

const { NativeCaptureModule } = NativeModules;
let eventEmitter = new NativeEventEmitter(NativeCaptureModule);

const subscription = eventEmitter.addListener("onCaptureEvent", onCaptureEvent);

const onCaptureEvent = (e) => {
  // maybe need to access handle here but this one doesn't get called in Android.
  console.log("index onCaptureEvent: ", e);
  if (NativeCaptureModule.logger) {
    NativeCaptureModule.logger.log("<= ", e);
  }
  const event = JSON.parse(e);
  if (NativeCaptureModule.onNotification) {
    NativeCaptureModule.onNotification(event);
  }
};

NativeCaptureModule.open = (host, notification) => {
  eventEmitter.addListener("onCaptureEvent", onCaptureEvent);
  NativeCaptureModule.onNotification = notification;
  console.log(NativeCaptureModule.onNotification);
  console.log("NativeCaptureModule.open callback: ", notification);
  console.log("NativeCaptureModule.open this: ", this);
  return NativeCaptureModule.openTransport(host).then(
    (result) => result.transport
  );
};

NativeCaptureModule.send = (handle, jsonRpc) => {
  NativeCaptureModule.logger.log("=> ", jsonRpc);
  return NativeCaptureModule.sendTransport(
    handle,
    JSON.stringify(jsonRpc)
  ).then((response) => {
    NativeCaptureModule.logger.log("<= ", response);
    return JSON.parse(response);
  });
};

NativeCaptureModule.close = (handle) => {
  console.log("index close");
  subscription.remove();
  return NativeCaptureModule.closeTransport(handle);
};

const getOptions = (platform, options, logger) => {
  const final = options || {};
  const noLogger = { log: () => {} };
  CaptureAppOS = platform.OS;
  if (platform.OS === "ios") {
    NativeCaptureModule.logger = logger || noLogger;
    final.transport = NativeCaptureModule;
  } else {
    NativeCaptureModule.startCaptureService();
  }
  return final;
};

class CaptureRn extends Capture {
  constructor(logger) {
    super(logger);
  }

  openForAndroid(tries, appInfo, callback, options) {
    const promise = new Promise((resolve, reject) => {
      let interval;
      const openRetry = () => {
        // options comes back undefined
        // need to access handle here?
        clearInterval(interval);
        super
          .open(appInfo, callback, options)
          .then((result) => resolve(result))
          .catch((err) => {
            console.log("android retry error: ", err);
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
    return promise;
  }

  open(appInfo, callback, options) {
    const finalOptions = getOptions(Platform, options, this.logger);
    if (Platform.OS === "android") {
      var newAppInfo = genAppInfo(appInfo, true);
      return this.openForAndroid(10, newAppInfo, callback, options);
    }
    var newAppInfo = genAppInfo(appInfo);
    return super.open(newAppInfo, callback, finalOptions);
  }
}

const genAppInfo = (appInfo, isAndroid) => {
  var id = isAndroid ? "appIdAndroid" : "appIdIos";
  var key = isAndroid ? "appKeyAndroid" : "appKeyIos";

  return {
    ...appInfo,
    appId: appInfo[id] || appInfo.appId,
    appKey: appInfo[key] || appInfo.appKey,
  };
};

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
  SoftScan,
  PowerState,
  MonitorDbg,
  Counter,
  Disconnect,
  ProfileSelect,
  ProfileConfig,
  Notifications,
  Timer,
  DataFormat,
  TriggerMode,
  ConnectReason,
  StartUpRoleSpp,
  ConnectBeepConfig,
  StandConfig,
  SocketCamTypes,
  NFCDeviceTypes,
};
