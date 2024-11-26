"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _socketmobileCapturejs = require("socketmobile-capturejs");
class CaptureHelper {
  static SocketCamTriggerOptions = [{
    label: 'Start',
    value: `${_socketmobileCapturejs.Trigger.Start}`
  }, {
    label: 'Continuous Scan',
    value: `${_socketmobileCapturejs.Trigger.ContinuousScan}`
  }];
  static SocketCamStatusOptions = {
    0: {
      message: 'ENABLE',
      buttonText: 'Enable',
      value: _socketmobileCapturejs.SocketCam.Enable
    },
    1: {
      message: 'DISABLE',
      buttonText: 'Disable',
      value: _socketmobileCapturejs.SocketCam.Disable
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
    let property = new _socketmobileCapturejs.CaptureProperty(_socketmobileCapturejs.CapturePropertyIds.SocketCamStatus, _socketmobileCapturejs.CapturePropertyTypes.None, {});
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
    let property = new _socketmobileCapturejs.CaptureProperty(_socketmobileCapturejs.CapturePropertyIds.SocketCamStatus, _socketmobileCapturejs.CapturePropertyTypes.Byte, enabled);
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
    let property = new _socketmobileCapturejs.CaptureProperty(_socketmobileCapturejs.CapturePropertyIds.TriggerDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, triggerType);
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
var _default = exports.default = CaptureHelper;
//# sourceMappingURL=CaptureHelper.js.map