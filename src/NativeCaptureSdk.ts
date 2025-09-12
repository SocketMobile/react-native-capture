import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Core methods
  startCaptureService(): Promise<object>;
  openTransport(host: string): Promise<{transport: {handle: number}}>;
  closeTransport(handle: number): Promise<string>;
  sendTransport(handle: number, jsonRpc: string): Promise<string>;
  getTargetView(reactTag: number): void;
  dismissViewController(): void;
  
  // SocketCam extension methods
  startSocketCamExtension?(clientHandle: number): void;
  startSocketCamExtensionCustom?(clientHandle: number): void;
  getCustomDeviceHandle?(): Promise<number>;
  
  // Event emitter methods - required for React Native
  addListener(eventType: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CaptureSdk');
