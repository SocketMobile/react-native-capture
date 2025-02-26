"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _react = _interopRequireWildcard(require("react"));
var _reactNativeCapture = require("react-native-capture");
var _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const {
  CaptureSdk
} = _reactNative.NativeModules;
const SocketCamView = ({
  clientOrDeviceHandle,
  triggerType,
  socketCamDevice,
  myLogger,
  handleSetStatus,
  socketCamCustomModalStyle,
  socketCamCustomStyle,
  androidSocketCamCustomView
}) => {
  const [isAndroid, setIsAndroid] = (0, _react.useState)(true);
  const [customViewHandle, setCustomViewHandle] = (0, _react.useState)(null);
  const containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    setIsAndroid(_reactNative.Platform.OS === 'android');
    let socketCamDeviceForView = socketCamDevice;
    _reactNativeCapture.CaptureHelper.setSocketCamTriggerProperty(socketCamDeviceForView, triggerType).then(() => {
      if (_reactNative.Platform.OS === 'android' && androidSocketCamCustomView) {
        handleCustomViewHandle().then(res => {
          setCustomViewHandle(res);
        });
      } else if (_reactNative.Platform.OS === 'ios') {
        const reactTag = (0, _reactNative.findNodeHandle)(containerRef.current);
        CaptureSdk.getTargetView(reactTag);
      }
    });
  }, [clientOrDeviceHandle, socketCamDevice]);
  const handleResult = args => {
    const {
      message,
      isError
    } = args;
    if (isError) {
      // only need to expose customViewHandle info if there's an error. Otherwise just log via myLogger or default console.log.
      if (handleSetStatus) {
        handleSetStatus(message);
      } else {
        myLogger ? myLogger.error(message) : console.error(message);
      }
    } else {
      myLogger ? myLogger.log(message) : console.log(message);
    }
  };
  const handleCustomViewHandle = async () => {
    // this is the method that will provide the device handle generated in the onViewReady in our customExtension to the bridge component
    // (in this example case, RNSocketCamCustomViewManager) provided by the developer to use their own Android custom view.
    try {
      const res = await CaptureSdk.getCustomDeviceHandle();
      handleResult({
        message: `handleCustomViewHandle: ${res}`
      });
      return res;
    } catch (err) {
      handleResult({
        message: `handleCustomViewHandle: ${err}`,
        isError: true
      });
      return null;
    }
  };

  // Clone the androidSocketCamCustomView and pass updated props.
  // This allows us to apply the customHandleValue to whatever custom component they want to provide.
  // The only required prop they will need to include is isScanContinuous. We control customDeviceHandle
  const clonedAndroidCustomView = androidSocketCamCustomView ? /*#__PURE__*/_react.default.cloneElement(androidSocketCamCustomView, {
    customViewHandle
  }) : null;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
    children: isAndroid ? clonedAndroidCustomView && customViewHandle ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
      children: clonedAndroidCustomView
    }) : null : socketCamCustomStyle ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      ref: containerRef,
      style: socketCamCustomStyle
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Modal, {
      presentationStyle: socketCamCustomModalStyle?.presentationStyle,
      transparent: socketCamCustomModalStyle?.transparent,
      animationType: socketCamCustomModalStyle?.animationType,
      visible: true,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        ref: containerRef,
        style: styles.container
      })
    })
  });
};
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1
  }
});
var _default = exports.default = SocketCamView;
//# sourceMappingURL=SocketCamView.js.map