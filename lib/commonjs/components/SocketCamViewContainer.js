"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _react = _interopRequireWildcard(require("react"));
var _reactNativeCapture = require("react-native-capture");
var _socketmobileCapturejs = require("socketmobile-capturejs");
var _SocketCamNativeView = _interopRequireDefault(require("./SocketCamNativeView"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Internal type used for cloneElement when the host app provides a custom Android camera view.

const SocketCamViewContainer = ({
  openSocketCamView,
  clientOrDeviceHandle,
  triggerType,
  socketCamDevice,
  handleSetSocketCamExtensionStatus,
  handleSetStatus,
  myLogger,
  socketCamCustomStyle,
  socketCamCustomModalStyle,
  androidSocketCamCustomView
}) => {
  const isAndroid = _reactNative.Platform.OS === 'android';
  const [customViewHandle, setCustomViewHandle] = (0, _react.useState)(null);

  // ── Effect 1: Android extension lifecycle ────────────────────────────────
  // Starts the SocketCam extension APK process on mount so it is running before
  // any setProperty(SocketCamStatus) call. Cleans up the DeviceEventEmitter
  // subscription on unmount to prevent listener accumulation across re-mounts.
  (0, _react.useEffect)(() => {
    if (!isAndroid) return;

    // Validate handle before registering any listener (fix: bug #2).
    if (clientOrDeviceHandle === undefined) {
      console.error('[SocketCamViewContainer] handle is undefined, cannot start SocketCamExtension');
      return;
    }
    handleSetSocketCamExtensionStatus?.('Starting...');

    // Register listener AFTER validating handle (fix: bug #2).
    const subscription = _reactNative.DeviceEventEmitter.addListener('SocketCamExtension', eventData => {
      const {
        message,
        status
      } = eventData;
      if (status === 2) {
        handleSetSocketCamExtensionStatus?.(`SocketCamExtension: ${message}`);
      }
    });
    if (androidSocketCamCustomView) {
      _reactNativeCapture.CaptureSdk.startSocketCamExtensionCustom(clientOrDeviceHandle);
    } else {
      _reactNativeCapture.CaptureSdk.startSocketCamExtension(clientOrDeviceHandle);
    }

    // Clean up listener on unmount (fix: bug #1).
    return () => {
      subscription.remove();
    };
    // Intentionally empty deps: extension is started once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect 2: Set trigger and fetch custom view handle ───────────────────
  // Runs whenever the view opens or the device / trigger changes.
  // Full deps array prevents stale closures (fix: bug #5).
  (0, _react.useEffect)(() => {
    if (!openSocketCamView || !socketCamDevice) return;
    const device = socketCamDevice;
    const triggerProp = new _socketmobileCapturejs.CaptureProperty(_socketmobileCapturejs.CapturePropertyIds.TriggerDevice, _socketmobileCapturejs.CapturePropertyTypes.Byte, triggerType);
    device.devCapture.setProperty(triggerProp).then(() => {
      if (isAndroid && androidSocketCamCustomView) {
        // CaptureSdk from 'react-native-capture' routes through the TurboModule on new architecture.
        _reactNativeCapture.CaptureSdk.getCustomDeviceHandle().then(res => setCustomViewHandle(res)).catch(err => {
          const msg = `[SocketCamViewContainer] getCustomDeviceHandle: ${err}`;
          handleSetStatus ? handleSetStatus(msg) : myLogger?.error(msg) ?? console.error(msg);
        });
      }
    }).catch(err => {
      const msg = `[SocketCamViewContainer] setTrigger failed: ${err}`;
      handleSetStatus ? handleSetStatus(msg) : myLogger?.error(msg) ?? console.error(msg);
    });
  }, [clientOrDeviceHandle, socketCamDevice, triggerType, openSocketCamView, androidSocketCamCustomView, handleSetStatus, myLogger, isAndroid]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!openSocketCamView) return null;
  if (!socketCamDevice) {
    console.warn('[SocketCamViewContainer] openSocketCamView is true but no socketCamDevice provided.');
    return null;
  }
  if (isAndroid) {
    // Android rendering is handled entirely by the host app's custom view.
    // Nothing to show until the custom view handle is ready.
    if (!androidSocketCamCustomView || !customViewHandle) return null;
    return /*#__PURE__*/_react.default.cloneElement(androidSocketCamCustomView, {
      customViewHandle
    });
  }

  // iOS: render inline subview or full-screen modal.
  // Fix: isAndroid is now a plain constant, not state (fix: bug #3).
  if (socketCamCustomStyle) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_SocketCamNativeView.default, {
      style: socketCamCustomStyle
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Modal, {
    presentationStyle: socketCamCustomModalStyle?.presentationStyle,
    transparent: socketCamCustomModalStyle?.transparent,
    animationType: socketCamCustomModalStyle?.animationType,
    visible: true,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_SocketCamNativeView.default, {
      style: styles.container
    })
  });
};
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1
  }
});
var _default = exports.default = SocketCamViewContainer;
//# sourceMappingURL=SocketCamViewContainer.js.map