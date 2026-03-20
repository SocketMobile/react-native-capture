package com.socketmobile;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;

/**
 * Hand-written fallback spec for when React Native codegen is not available
 * (i.e. when New Architecture / TurboModules is disabled).
 *
 * When New Architecture IS enabled, codegen generates its own NativeCaptureSdkSpec
 * which takes precedence over this file (this file is excluded via source sets).
 */
public abstract class NativeCaptureSdkSpec extends ReactContextBaseJavaModule {

    public static final String NAME = "CaptureSdk";

    NativeCaptureSdkSpec(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return NAME;
    }

    public abstract void startCaptureService(Promise promise);

    public abstract void openTransport(String host, Promise promise);

    public abstract void closeTransport(double handle, Promise promise);

    public abstract void sendTransport(double handle, String jsonRpc, Promise promise);

    public abstract void getTargetView(double reactTag);

    public abstract void dismissViewController();

    public abstract void startSocketCamExtension(double clientHandle);

    public abstract void startSocketCamExtensionCustom(double clientHandle);

    public abstract void getCustomDeviceHandle(Promise promise);

    public abstract void addListener(String eventType);

    public abstract void removeListeners(double count);
}
