"use strict";

// src/components/SocketCamNativeView.ios.ts
import { requireNativeComponent } from 'react-native';

// Wraps the native RNSocketCamViewManager (iOS only).
// The view is a SocketCamContainerView that self-embeds the SDK's camera view
// via NSNotification when CaptureSdk sets the socketCamView property.
const SocketCamNativeView = requireNativeComponent('RNSocketCamView');
export default SocketCamNativeView;
//# sourceMappingURL=SocketCamNativeView.ios.js.map