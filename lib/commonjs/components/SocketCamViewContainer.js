"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _react = _interopRequireWildcard(require("react"));
var _reactNativeCapture = require("react-native-capture");
var _SocketCamView = _interopRequireDefault(require("./SocketCamView"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const SocketCamViewContainer = ({
  openSocketCamView,
  handleSetSocketCamExtensionStatus,
  socketCamDevice,
  androidSocketCamCustomView,
  ...props
}) => {
  const startSocketCamExtension = (handle, usingAndroidCustomView) => {
    if (handleSetSocketCamExtensionStatus) {
      handleSetSocketCamExtensionStatus('Starting...');
    }
    _reactNative.DeviceEventEmitter.addListener('SocketCamExtension', socketCamExtensionCallback);
    if (handle === undefined) {
      console.error('handle is undefined, cannot start SocketCamExtension');
      return;
    }
    if (usingAndroidCustomView) {
      _reactNativeCapture.CaptureSdk.startSocketCamExtensionCustom(handle);
    } else {
      _reactNativeCapture.CaptureSdk.startSocketCamExtension(handle);
    }
  };
  const socketCamExtensionCallback = eventData => {
    const {
      socketCamCapture,
      handleSetSocketCamEnabled
    } = props;
    const {
      message,
      status
    } = eventData;
    if (status === 2) {
      if (handleSetSocketCamExtensionStatus) {
        handleSetSocketCamExtensionStatus(`SocketCamExtension: ${message}`);
      }
      _reactNativeCapture.CaptureHelper.getSocketCamEnabled({
        socketCamCapture,
        handleSetSocketCamEnabled
      });
    }
    return status;
  };
  (0, _react.useEffect)(() => {
    const {
      clientOrDeviceHandle,
      socketCamCapture,
      handleSetSocketCamEnabled,
      handleSetStatus
    } = props;
    if (_reactNative.Platform.OS === 'android') {
      startSocketCamExtension(clientOrDeviceHandle, !!androidSocketCamCustomView);
    } else {
      _reactNativeCapture.CaptureHelper.getSocketCamEnabled({
        socketCamCapture,
        handleSetSocketCamEnabled
      }).then(res => {
        handleSetStatus && handleSetStatus(res);
      });
    }
  }, []);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [openSocketCamView && socketCamDevice ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_SocketCamView.default, {
      openSocketCamView: openSocketCamView,
      socketCamDevice: socketCamDevice,
      socketCamDeviceForView: socketCamDevice,
      androidSocketCamCustomView: androidSocketCamCustomView,
      ...props
    }) : null, openSocketCamView && !socketCamDevice ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      children: " No SocketCam device provided."
    }) : null]
  });
};
var _default = exports.default = SocketCamViewContainer;
//# sourceMappingURL=SocketCamViewContainer.js.map