"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
// src/components/SocketCamNativeView.ios.ts

// Wraps the native RNSocketCamViewManager (iOS only).
// The view is a SocketCamContainerView that self-embeds the SDK's camera view
// via NSNotification when CaptureSdk sets the socketCamView property.
const SocketCamNativeView = (0, _reactNative.requireNativeComponent)('RNSocketCamView');
var _default = exports.default = SocketCamNativeView;
//# sourceMappingURL=SocketCamNativeView.ios.js.map