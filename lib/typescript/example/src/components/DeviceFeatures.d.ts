import React from 'react';
import { type CaptureHelperDevice, CaptureRn } from 'react-native-capture';
interface DeviceFeaturesProps {
    device: CaptureHelperDevice;
    onBack: () => void;
    socketCamCapture?: CaptureRn;
    clientOrDeviceHandle?: number;
    isAndroid?: boolean;
    setStatus?: (s: string) => void;
    handleIsContinuous?: (v: boolean) => void;
    openSocketCamView?: boolean;
    setOpenSocketCamView?: React.Dispatch<React.SetStateAction<boolean>>;
}
declare const DeviceFeatures: React.FC<DeviceFeaturesProps>;
export default DeviceFeatures;
//# sourceMappingURL=DeviceFeatures.d.ts.map