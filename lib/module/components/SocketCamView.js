"use strict";

import { NativeModules, View, findNodeHandle, Modal, Platform, StyleSheet } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { CaptureHelper } from 'react-native-capture';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
const {
  CaptureSdk
} = NativeModules;
const SocketCamView = ({
  clientOrDeviceHandle,
  triggerType,
  socketCamDevice,
  myLogger,
  handleSetStatus,
  socketCamCustomModalStyle,
  socketCamCustomStyle,
  androidSocketCamCustomView
}) => {
  const [isAndroid, setIsAndroid] = useState(true);
  const [customViewHandle, setCustomViewHandle] = useState(null);
  const containerRef = useRef(null);
  useEffect(() => {
    setIsAndroid(Platform.OS === 'android');
    let socketCamDeviceForView = socketCamDevice;
    CaptureHelper.setSocketCamTriggerProperty(socketCamDeviceForView, triggerType).then(() => {
      if (Platform.OS === 'android' && androidSocketCamCustomView) {
        handleCustomViewHandle().then(res => {
          setCustomViewHandle(res);
        });
      } else if (Platform.OS === 'ios') {
        const reactTag = findNodeHandle(containerRef.current);
        CaptureSdk.getTargetView(reactTag);
      }
    });
  }, [clientOrDeviceHandle, socketCamDevice]);
  const handleResult = args => {
    const {
      message,
      isError
    } = args;
    if (isError) {
      // only need to expose customViewHandle info if there's an error. Otherwise just log via myLogger or default console.log.
      if (handleSetStatus) {
        handleSetStatus(message);
      } else {
        myLogger ? myLogger.error(message) : console.error(message);
      }
    } else {
      myLogger ? myLogger.log(message) : console.log(message);
    }
  };
  const handleCustomViewHandle = async () => {
    // this is the method that will provide the device handle generated in the onViewReady in our customExtension to the bridge component
    // (in this example case, RNSocketCamCustomViewManager) provided by the developer to use their own Android custom view.
    try {
      const res = await CaptureSdk.getCustomDeviceHandle();
      handleResult({
        message: `handleCustomViewHandle: ${res}`
      });
      return res;
    } catch (err) {
      handleResult({
        message: `handleCustomViewHandle: ${err}`,
        isError: true
      });
      return null;
    }
  };

  // Clone the androidSocketCamCustomView and pass updated props.
  // This allows us to apply the customHandleValue to whatever custom component they want to provide.
  // The only required prop they will need to include is isScanContinuous. We control customDeviceHandle
  const clonedAndroidCustomView = androidSocketCamCustomView ? /*#__PURE__*/React.cloneElement(androidSocketCamCustomView, {
    customViewHandle
  }) : null;
  return /*#__PURE__*/_jsx(_Fragment, {
    children: isAndroid ? clonedAndroidCustomView && customViewHandle ? /*#__PURE__*/_jsx(_Fragment, {
      children: clonedAndroidCustomView
    }) : null : socketCamCustomStyle ? /*#__PURE__*/_jsx(View, {
      ref: containerRef,
      style: socketCamCustomStyle
    }) : /*#__PURE__*/_jsx(Modal, {
      presentationStyle: socketCamCustomModalStyle?.presentationStyle,
      transparent: socketCamCustomModalStyle?.transparent,
      animationType: socketCamCustomModalStyle?.animationType,
      visible: true,
      children: /*#__PURE__*/_jsx(View, {
        ref: containerRef,
        style: styles.container
      })
    })
  });
};
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
export default SocketCamView;
//# sourceMappingURL=SocketCamView.js.map