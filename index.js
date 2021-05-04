import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { Capture, SktErrors, CapturePropertyIds, CapturePropertyTypes, CaptureProperty, CaptureEventIds, CaptureEventTypes, CaptureEvent, CaptureDeviceType, CaptureDataSourceID, CaptureDataSourceFlags, CaptureDataSourceStatus, DataConfirmationMode, DeviceDataAcknowledgment, SecurityMode, Trigger, DeletePairing, SoundActionType, SoundFrequency, RumbleActionType, LocalDecodeAction, DataConfirmationLed, DataConfirmationBeep, DataConfirmationRumble, Flash, SoftScan, PowerState, MonitorDbg, Counter, Disconnect, ProfileSelect, ProfileConfig, Notifications, Timer, DataFormat, TriggerMode, ConnectReason, StartUpRoleSpp, ConnectBeepConfig, StandConfig } from 'socketmobile-capturejs';

const { JsonRpcTransport } = NativeModules;
const eventEmitter = new NativeEventEmitter(JsonRpcTransport);

const onCaptureEvent = e => {
  console.log('index onCaptureEvent: ', e);
  if(JsonRpcTransport.logger){
    JsonRpcTransport.logger.log('<= ', e);
  }
  const event = JSON.parse(e);
  if(JsonRpcTransport.onNotification) {
    JsonRpcTransport.onNotification(event);
  }
};

JsonRpcTransport.open = (host, notification) => {
  console.log('JsonRpcTransport.open callback: ', notification);
  console.log('JsonRpcTransport.open this: ', this);
  JsonRpcTransport.onNotification = notification;
  eventEmitter.subscription = eventEmitter.addListener('onCaptureEvent', onCaptureEvent);
  return JsonRpcTransport.openTransport(host).then(result => result.transport);
}

JsonRpcTransport.send = (handle, jsonRpc) => {
  JsonRpcTransport.logger.log('=> ',jsonRpc);
  return JsonRpcTransport.sendTransport(handle, JSON.stringify(jsonRpc))
  .then(response => {
    JsonRpcTransport.logger.log('<= ',response);
    return JSON.parse(response);
  });
}

JsonRpcTransport.close = (handle) => {
  eventEmitter.subscription.remove();
  return JsonRpcTransport.closeTransport(handle);
}

const getOptions = (platform, options, logger) => {
  const final = options || {};
  const noLogger = {log:()=>{}};
  if (platform.OS === 'ios') {
    JsonRpcTransport.logger = logger || noLogger;
    final.transport = JsonRpcTransport;
  }
  else {
    JsonRpcTransport.startCaptureService();
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
        clearInterval(interval);
        super.open(appInfo, callback, options)
        .then(result => resolve(result))
        .catch(err => {
          console.log('android retry error: ', err);
          if(tries > 0){
            tries -= 1;
            interval = setInterval(openRetry, 250);
          }
          else {
            reject(err);
          }
        })
      };
      interval = setInterval(openRetry, 250);
    });
    return promise;
  }  
  
  open(appInfo, callback, options) {
    const finalOptions = getOptions(Platform, options, this.logger);
    if(Platform.OS === 'android'){
      return this.openForAndroid(10, appInfo, callback, options);
    }
    return super.open(appInfo, callback, finalOptions);
  }
}

export { CaptureRn, SktErrors, CapturePropertyIds, CapturePropertyTypes, CaptureProperty, CaptureEventIds, CaptureEventTypes, CaptureEvent, CaptureDeviceType, CaptureDataSourceID, CaptureDataSourceFlags, CaptureDataSourceStatus, DataConfirmationMode, DeviceDataAcknowledgment, SecurityMode, Trigger, DeletePairing, SoundActionType, SoundFrequency, RumbleActionType, LocalDecodeAction, DataConfirmationLed, DataConfirmationBeep, DataConfirmationRumble, Flash, SoftScan, PowerState, MonitorDbg, Counter, Disconnect, ProfileSelect, ProfileConfig, Notifications, Timer, DataFormat, TriggerMode, ConnectReason, StartUpRoleSpp, ConnectBeepConfig, StandConfig };
