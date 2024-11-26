function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { Platform, DeviceEventEmitter, Text } from 'react-native';
import React, { useEffect } from 'react';
import { CaptureHelper, CaptureSdk } from 'react-native-capture';
import SocketCamView from './SocketCamView';
const SocketCamViewContainer = ({
  openSocketCamView,
  handleSetSocketCamExtensionStatus,
  socketCamDevice,
  ...props
}) => {
  const startSocketCamExtension = (handle, usingAndroidCustomView) => {
    if (handleSetSocketCamExtensionStatus) {
      handleSetSocketCamExtensionStatus('Starting...');
    }
    DeviceEventEmitter.addListener('SocketCamExtension', socketCamExtensionCallback);
    if (handle === undefined) {
      console.error('handle is undefined, cannot start SocketCamExtension');
      return;
    }
    if (usingAndroidCustomView) {
      CaptureSdk.startSocketCamExtensionCustom(handle);
    } else {
      CaptureSdk.startSocketCamExtension(handle);
    }
  };
  const socketCamExtensionCallback = eventData => {
    const {
      socketCamCapture,
      handleSetSocketCamEnabled
    } = props;
    const {
      message,
      status
    } = eventData;
    if (status === 2) {
      if (handleSetSocketCamExtensionStatus) {
        handleSetSocketCamExtensionStatus(`SocketCamExtension: ${message}`);
      }
      CaptureHelper.getSocketCamEnabled({
        socketCamCapture,
        handleSetSocketCamEnabled
      });
    }
    return status;
  };
  useEffect(() => {
    const {
      clientOrDeviceHandle,
      socketCamCapture,
      handleSetSocketCamEnabled,
      androidSocketCamCustomView,
      handleSetStatus
    } = props;
    if (Platform.OS === 'android') {
      startSocketCamExtension(clientOrDeviceHandle, !!androidSocketCamCustomView);
    } else {
      CaptureHelper.getSocketCamEnabled({
        socketCamCapture,
        handleSetSocketCamEnabled
      }).then(res => {
        handleSetStatus && handleSetStatus(res);
      });
    }
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, openSocketCamView && socketCamDevice ? /*#__PURE__*/React.createElement(SocketCamView, _extends({
    openSocketCamView: openSocketCamView,
    socketCamDevice: socketCamDevice,
    socketCamDeviceForView: socketCamDevice
  }, props)) : null, openSocketCamView && !socketCamDevice ? /*#__PURE__*/React.createElement(Text, null, " No SocketCam device provided.") : null);
};
export default SocketCamViewContainer;
//# sourceMappingURL=SocketCamViewContainer.js.map