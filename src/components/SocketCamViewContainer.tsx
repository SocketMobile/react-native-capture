import {
  Platform,
  DeviceEventEmitter,
  Modal,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { CaptureSdk, type CaptureDeviceInfo, type ExtensionEventData } from 'react-native-capture';
import {
  CaptureProperty,
  CapturePropertyIds,
  CapturePropertyTypes,
} from 'socketmobile-capturejs';
import { type SocketCamViewContainerProps } from '../interfaces';
import SocketCamNativeView from './SocketCamNativeView';

// Internal type used for cloneElement when the host app provides a custom Android camera view.
interface AndroidCustomViewProps {
  customViewHandle: string | null;
}

const SocketCamViewContainer: React.FC<SocketCamViewContainerProps> = ({
  openSocketCamView,
  clientOrDeviceHandle,
  triggerType,
  socketCamDevice,
  handleSetSocketCamExtensionStatus,
  handleSetStatus,
  myLogger,
  socketCamCustomStyle,
  socketCamCustomModalStyle,
  androidSocketCamCustomView,
}) => {
  const isAndroid = Platform.OS === 'android';
  const [customViewHandle, setCustomViewHandle] = useState<string | null>(null);

  // ── Effect 1: Android extension lifecycle ────────────────────────────────
  // Starts the SocketCam extension APK process on mount so it is running before
  // any setProperty(SocketCamStatus) call. Cleans up the DeviceEventEmitter
  // subscription on unmount to prevent listener accumulation across re-mounts.
  useEffect(() => {
    if (!isAndroid) return;

    // Validate handle before registering any listener (fix: bug #2).
    if (clientOrDeviceHandle === undefined) {
      console.error(
        '[SocketCamViewContainer] handle is undefined, cannot start SocketCamExtension'
      );
      return;
    }

    handleSetSocketCamExtensionStatus?.('Starting...');

    // Register listener AFTER validating handle (fix: bug #2).
    const subscription = DeviceEventEmitter.addListener(
      'SocketCamExtension',
      (eventData: ExtensionEventData) => {
        const { message, status } = eventData;
        if (status === 2) {
          handleSetSocketCamExtensionStatus?.(
            `SocketCamExtension: ${message}`
          );
        }
      }
    );

    if (androidSocketCamCustomView) {
      CaptureSdk.startSocketCamExtensionCustom(clientOrDeviceHandle);
    } else {
      CaptureSdk.startSocketCamExtension(clientOrDeviceHandle);
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
  useEffect(() => {
    if (!openSocketCamView || !socketCamDevice) return;

    const device = socketCamDevice as CaptureDeviceInfo;
    const triggerProp = new CaptureProperty(
      CapturePropertyIds.TriggerDevice,
      CapturePropertyTypes.Byte,
      triggerType
    );

    device.devCapture
      .setProperty(triggerProp)
      .then(() => {
        if (isAndroid && androidSocketCamCustomView) {
          // CaptureSdk from 'react-native-capture' routes through the TurboModule on new architecture.
          CaptureSdk.getCustomDeviceHandle()
            .then((res: string) => setCustomViewHandle(res))
            .catch((err: any) => {
              const msg = `[SocketCamViewContainer] getCustomDeviceHandle: ${err}`;
              handleSetStatus
                ? handleSetStatus(msg)
                : myLogger?.error(msg) ?? console.error(msg);
            });
        }
      })
      .catch((err: any) => {
        const msg = `[SocketCamViewContainer] setTrigger failed: ${err}`;
        handleSetStatus
          ? handleSetStatus(msg)
          : myLogger?.error(msg) ?? console.error(msg);
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
    return React.cloneElement(
      androidSocketCamCustomView as React.ReactElement<AndroidCustomViewProps>,
      { customViewHandle }
    );
  }

  // iOS: render inline subview or full-screen modal.
  // Fix: isAndroid is now a plain constant, not state (fix: bug #3).
  if (socketCamCustomStyle) {
    return <SocketCamNativeView style={socketCamCustomStyle} />;
  }

  return (
    <Modal
      presentationStyle={socketCamCustomModalStyle?.presentationStyle}
      transparent={socketCamCustomModalStyle?.transparent}
      animationType={socketCamCustomModalStyle?.animationType}
      visible={true}
    >
      <SocketCamNativeView style={styles.container} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default SocketCamViewContainer;
