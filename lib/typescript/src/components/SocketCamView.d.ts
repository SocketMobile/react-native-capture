import React from 'react';
import { type CaptureDeviceInfo } from 'react-native-capture';
import { type SocketCamViewContainerProps } from '../interfaces';
export interface AndroidCustomViewProps {
    customViewHandle: string | null;
}
interface SocketCamViewProps extends SocketCamViewContainerProps {
    socketCamDeviceForView: CaptureDeviceInfo;
    androidSocketCamCustomView?: React.ReactElement<AndroidCustomViewProps>;
}
declare const SocketCamView: React.FC<SocketCamViewProps>;
export default SocketCamView;
//# sourceMappingURL=SocketCamView.d.ts.map