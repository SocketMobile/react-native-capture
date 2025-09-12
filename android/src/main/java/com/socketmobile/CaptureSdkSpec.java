package com.socketmobile;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

/**
 * This is the definition for the TurboModule spec.
 * This interface defines the contract between JavaScript and native Android code.
 */
public abstract class CaptureSdkSpec extends ReactContextBaseJavaModule implements TurboModule {
    
    public static final String NAME = "CaptureSdk";
    
    CaptureSdkSpec(ReactApplicationContext context) {
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
    
    // SocketCam extension methods
    public abstract void startSocketCamExtension(double clientHandle);
    
    public abstract void startSocketCamExtensionCustom(double clientHandle);
    
    public abstract void getCustomDeviceHandle(Promise promise);
    
    // Event emitter methods - required for RN event system
    public abstract void addListener(String eventType);
    
    public abstract void removeListeners(double count);
}
