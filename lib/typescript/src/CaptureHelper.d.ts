import { type CaptureDeviceInfo } from 'react-native-capture';
import { type SocketCamTriggerButtonData, type SocketCamStatusOption, type GetSocketCamEnabledArguments, type SetSocketCamEnabledArguments } from './interfaces';
declare class CaptureHelper {
    static SocketCamTriggerOptions: SocketCamTriggerButtonData[];
    static SocketCamStatusOptions: SocketCamStatusOption;
    private static errorCheck;
    static getSocketCamEnabled({ socketCamCapture, handleSetSocketCamEnabled, fromCallback, }: GetSocketCamEnabledArguments): Promise<string | false>;
    static setSocketCamEnabled({ socketCamCapture, handleSetSocketCamEnabled, enabled, }: SetSocketCamEnabledArguments): Promise<string>;
    static setSocketCamTriggerProperty(socketCamDevice: CaptureDeviceInfo, triggerType: number): Promise<string>;
}
export default CaptureHelper;
//# sourceMappingURL=CaptureHelper.d.ts.map