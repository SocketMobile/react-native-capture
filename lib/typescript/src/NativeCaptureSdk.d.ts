import type { TurboModule } from 'react-native';
export interface Spec extends TurboModule {
    startCaptureService(): Promise<object>;
    openTransport(host: string): Promise<{
        transport: {
            handle: number;
        };
    }>;
    closeTransport(handle: number): Promise<string>;
    sendTransport(handle: number, jsonRpc: string): Promise<string>;
    getTargetView(reactTag: number): void;
    dismissViewController(): void;
    startSocketCamExtension?(clientHandle: number): void;
    startSocketCamExtensionCustom?(clientHandle: number): void;
    getCustomDeviceHandle?(): Promise<number>;
    addListener(eventType: string): void;
    removeListeners(count: number): void;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeCaptureSdk.d.ts.map