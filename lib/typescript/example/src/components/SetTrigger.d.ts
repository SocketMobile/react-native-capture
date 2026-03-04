import React from 'react';
import { type CaptureHelperDevice, CaptureRn } from 'react-native-capture';
interface SetTriggerProps {
    device: CaptureHelperDevice;
    onBack: () => void;
    socketCamCapture?: CaptureRn;
    clientOrDeviceHandle?: number;
    isAndroid?: boolean;
    setStatus?: (s: string) => void;
    handleIsContinuous?: (isContinuous: boolean) => void;
    openSocketCamView?: boolean;
    setOpenSocketCamView?: React.Dispatch<React.SetStateAction<boolean>>;
}
declare const SetTrigger: React.FC<SetTriggerProps>;
export default SetTrigger;
//# sourceMappingURL=SetTrigger.d.ts.map