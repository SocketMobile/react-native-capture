import { CapturePropertyIds, CapturePropertyTypes, CaptureProperty, Trigger, SocketCam } from 'socketmobile-capturejs';
class CaptureHelper {
  static SocketCamTriggerOptions = [{
    label: 'Start',
    value: `${Trigger.Start}`
  }, {
    label: 'Continuous Scan',
    value: `${Trigger.ContinuousScan}`
  }];
  static SocketCamStatusOptions = {
    0: {
      message: 'ENABLE',
      buttonText: 'Enable',
      value: SocketCam.Enable
    },
    1: {
      message: 'DISABLE',
      buttonText: 'Disable',
      value: SocketCam.Disable
    }
  };
  // Helper method for error checking
  static errorCheck = error => {
    return error?.error || error;
  };
  static async getSocketCamEnabled({
    socketCamCapture,
    handleSetSocketCamEnabled,
    fromCallback
  }) {
    let property = new CaptureProperty(CapturePropertyIds.SocketCamStatus, CapturePropertyTypes.None, {});
    try {
      let data = await socketCamCapture.getProperty(property);
      handleSetSocketCamEnabled(data.value);
      let statusOption = CaptureHelper.SocketCamStatusOptions[data.value];
      return !fromCallback && `successfully retrieved SocketCamStatus: '${statusOption?.message}'`;
    } catch (error) {
      let err = CaptureHelper.errorCheck(error);
      return `failed to get SocketCamStatus: ${err.code} : ${err.message}`;
    }
  }

  // Method to set SocketCam enabled status
  static async setSocketCamEnabled({
    socketCamCapture,
    handleSetSocketCamEnabled,
    enabled
  }) {
    let property = new CaptureProperty(CapturePropertyIds.SocketCamStatus, CapturePropertyTypes.Byte, enabled);
    try {
      await socketCamCapture.setProperty(property);
      handleSetSocketCamEnabled(enabled);
      await CaptureHelper.getSocketCamEnabled({
        socketCamCapture,
        handleSetSocketCamEnabled,
        fromCallback: true
      });
      return `successfully set SocketCamStatus: '${CaptureHelper.SocketCamStatusOptions[enabled]?.message}'`;
    } catch (error) {
      let err = CaptureHelper.errorCheck(error);
      return `failed to set SocketCamStatus: ${err.code} : ${err.message}`;
    }
  }
  // Method to set SocketCam trigger property
  static async setSocketCamTriggerProperty(socketCamDevice, triggerType) {
    let property = new CaptureProperty(CapturePropertyIds.TriggerDevice, CapturePropertyTypes.Byte, triggerType);
    try {
      await socketCamDevice.devCapture.setProperty(property);
      let triggerOption = CaptureHelper.SocketCamTriggerOptions.find(trgOpt => parseInt(trgOpt.value) === triggerType);
      return `successfully changed TriggerDevice: '${triggerOption?.label}'`;
    } catch (error) {
      let err = CaptureHelper.errorCheck(error);
      return `failed to set TriggerDevice: ${err.code} : ${err.message}`;
    }
  }
}
export default CaptureHelper;
//# sourceMappingURL=CaptureHelper.js.map