import React from 'react';
import { type CaptureDeviceInfo } from 'react-native-capture';
import { type SocketCamViewContainerProps } from '../interfaces';
interface SocketCamViewProps extends SocketCamViewContainerProps {
    socketCamDeviceForView: CaptureDeviceInfo;
}
declare const SocketCamView: React.FC<SocketCamViewProps>;
export default SocketCamView;
//# sourceMappingURL=SocketCamView.d.ts.map