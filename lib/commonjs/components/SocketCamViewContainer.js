"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _react = _interopRequireWildcard(require("react"));
var _reactNativeCapture = require("react-native-capture");
var _SocketCamView = _interopRequireDefault(require("./SocketCamView"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SocketCamViewContainer = ({
  openSocketCamView,
  handleSetSocketCamExtensionStatus,
  socketCamDevice,
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
      androidSocketCamCustomView,
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
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, openSocketCamView && socketCamDevice ? /*#__PURE__*/_react.default.createElement(_SocketCamView.default, _extends({
    openSocketCamView: openSocketCamView,
    socketCamDevice: socketCamDevice,
    socketCamDeviceForView: socketCamDevice
  }, props)) : null, openSocketCamView && !socketCamDevice ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, null, " No SocketCam device provided.") : null);
};
var _default = exports.default = SocketCamViewContainer;
//# sourceMappingURL=SocketCamViewContainer.js.map