import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import {
  CaptureRn,
  type CaptureDeviceInfo,
  type SocketLogger,
} from 'react-native-capture';

interface SocketCamModalStyleProps {
  presentationStyle?:
    | 'fullScreen'
    | 'pageSheet'
    | 'formSheet'
    | 'overFullScreen';
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
}

interface SocketCamViewContainerProps {
  clientOrDeviceHandle: number;
  openSocketCamView: boolean;
  socketCamCapture: CaptureRn;
  socketCamDevice: CaptureDeviceInfo | null | undefined;
  handleSetSocketCamEnabled: Function;
  triggerType: number;
  myLogger?: SocketLogger;
  handleSetStatus?: Function;
  handleSetSocketCamExtensionStatus?: Function;
  socketCamCustomModalStyle?: SocketCamModalStyleProps;
  socketCamCustomStyle?: StyleProp<ViewStyle>;
  // this is the android SocketCam view provided by the developer if they want to customize the SocketCam view.
  androidSocketCamCustomView?: React.ReactElement;
}

export type {
  SocketCamViewContainerProps,
};
