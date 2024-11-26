import React from 'react';
import { type CaptureDeviceInfo, CaptureRn } from 'react-native-capture';
interface MainViewProps {
    deviceCapture: CaptureRn | null;
    setStatus: (status: string) => void;
    myLogger: any;
    devices: CaptureDeviceInfo[];
}
declare const MainView: React.FC<MainViewProps>;
export default MainView;
//# sourceMappingURL=MainView.d.ts.map