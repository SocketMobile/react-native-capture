import React from 'react';
import { type CaptureHelperDevice, type DiscoveredDeviceInfo } from 'react-native-capture';
interface MainViewProps {
    devices: CaptureHelperDevice[];
    bleDiscovery: () => void;
    classicDiscovery: () => void;
    onDisconnectDevice: (device: CaptureHelperDevice) => void;
    onSelectDevice: (device: CaptureHelperDevice) => void;
    discoveredDevices: DiscoveredDeviceInfo[];
    onConnectDevice: (device: DiscoveredDeviceInfo) => void;
    isAndroid?: boolean;
    socketCamEnabled?: boolean;
    onToggleSocketCam?: () => void;
}
declare const MainView: React.FC<MainViewProps>;
export default MainView;
//# sourceMappingURL=MainView.d.ts.map