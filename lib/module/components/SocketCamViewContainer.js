"use strict";

import { Platform, DeviceEventEmitter, Text } from 'react-native';
import React, { useEffect } from 'react';
import { CaptureHelper, CaptureSdk } from 'react-native-capture';
import SocketCamView from './SocketCamView';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
const SocketCamViewContainer = ({
  openSocketCamView,
  handleSetSocketCamExtensionStatus,
  socketCamDevice,
  androidSocketCamCustomView,
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
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [openSocketCamView && socketCamDevice ? /*#__PURE__*/_jsx(SocketCamView, {
      openSocketCamView: openSocketCamView,
      socketCamDevice: socketCamDevice,
      socketCamDeviceForView: socketCamDevice,
      androidSocketCamCustomView: androidSocketCamCustomView,
      ...props
    }) : null, openSocketCamView && !socketCamDevice ? /*#__PURE__*/_jsx(Text, {
      children: " No SocketCam device provided."
    }) : null]
  });
};
export default SocketCamViewContainer;
//# sourceMappingURL=SocketCamViewContainer.js.map