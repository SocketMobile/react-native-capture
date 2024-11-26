import React from 'react';
import { CaptureRn, type CaptureDeviceInfo } from 'react-native-capture';
interface SocketCamProps {
    socketCamCapture: CaptureRn;
    setStatus: Function;
    myLogger?: any;
    socketCamDevice: CaptureDeviceInfo | null;
    clientOrDeviceHandle: number;
    handleIsContinuous: Function;
    isAndroid: boolean;
    openSocketCamView: boolean;
    setOpenSocketCamView: React.Dispatch<React.SetStateAction<boolean>>;
}
declare const SocketCam: React.FC<SocketCamProps>;
export default SocketCam;
//# sourceMappingURL=SocketCam.d.ts.map