import { Platform, DeviceEventEmitter, Text } from 'react-native';
import React, { useEffect } from 'react';
import {
  CaptureHelper,
  CaptureSdk,
  type ExtensionEventData,
} from 'react-native-capture';
import { type SocketCamViewContainerProps } from '../interfaces';
import SocketCamView, { type AndroidCustomViewProps } from './SocketCamView';

const SocketCamViewContainer: React.FC<SocketCamViewContainerProps> = ({
  openSocketCamView,
  handleSetSocketCamExtensionStatus,
  socketCamDevice,
  androidSocketCamCustomView,
  ...props
}) => {
  const startSocketCamExtension = (
    handle: number,
    usingAndroidCustomView?: boolean
  ) => {
    if (handleSetSocketCamExtensionStatus) {
      handleSetSocketCamExtensionStatus('Starting...');
    }

    DeviceEventEmitter.addListener(
      'SocketCamExtension',
      socketCamExtensionCallback
    );
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

  const socketCamExtensionCallback = (eventData: ExtensionEventData) => {
    const { socketCamCapture, handleSetSocketCamEnabled } = props;
    const { message, status } = eventData;
    if (status === 2) {
      if (handleSetSocketCamExtensionStatus) {
        handleSetSocketCamExtensionStatus(`SocketCamExtension: ${message}`);
      }
      CaptureHelper.getSocketCamEnabled({
        socketCamCapture,
        handleSetSocketCamEnabled,
      });
    }
    return status;
  };

  useEffect(() => {
    const {
      clientOrDeviceHandle,
      socketCamCapture,
      handleSetSocketCamEnabled,
      handleSetStatus,
    } = props;
    if (Platform.OS === 'android') {
      startSocketCamExtension(
        clientOrDeviceHandle,
        !!androidSocketCamCustomView
      );
    } else {
      CaptureHelper.getSocketCamEnabled({
        socketCamCapture,
        handleSetSocketCamEnabled,
      }).then((res) => {
        handleSetStatus && handleSetStatus(res);
      });
    }
  }, []);

  return (
    <>
      {openSocketCamView && socketCamDevice ? (
        <SocketCamView
          openSocketCamView={openSocketCamView}
          socketCamDevice={socketCamDevice}
          socketCamDeviceForView={socketCamDevice!}
          androidSocketCamCustomView={androidSocketCamCustomView as React.ReactElement<AndroidCustomViewProps>}
          {...props}
        />
      ) : null}
      {openSocketCamView && !socketCamDevice ? (
        <Text> No SocketCam device provided.</Text>
      ) : null}
    </>
  );
};

export default SocketCamViewContainer;
