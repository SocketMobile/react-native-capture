package com.socketmobile;

import android.app.Application;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.app.Activity;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.socketmobile.capture.socketcam.client.CaptureExtension;
import com.socketmobile.capture.client.ConnectionState;
import com.socketmobile.capture.CaptureError;
import com.socketmobile.capture.troy.ExtensionScope;
import com.socketmobile.CaptureService;

import static android.content.Intent.FLAG_RECEIVER_FOREGROUND;

public class CaptureModule extends ReactContextBaseJavaModule  {

    private static final String TAG = CaptureModule.class.getName();
    private static final String BASE_PACKAGE = "com.socketmobile.capture";
    private static final String SERVICE_APP_ID = "com.socketmobile.companion";
    private static final String BROADCAST_RECEIVER = BASE_PACKAGE + ".StartService";
    private static final String ACTION = BASE_PACKAGE + ".START_SERVICE";
    private final ReactApplicationContext reactContext;
    private CaptureExtension mCaptureExtension;

    public CaptureModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    public class SocketCamExtensionEvent {
        String message;
        int status;
    
        public SocketCamExtensionEvent(String message, int status) {
            this.message = message;
            this.status = status;
        }
    }

    @ReactMethod
    public void triggerEvent(SocketCamExtensionEvent ev) {
        WritableNativeMap eventData = new WritableNativeMap();
        eventData.putString("message", ev.message);
        eventData.putInt("status", ev.status);
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("SocketCamExtension", eventData);
    }

    @Override
    public String getName() {
        return "NativeCaptureModule";
    }

    @ReactMethod
    public void startSocketCamExtension(int clientHandle){
        mCaptureExtension = new CaptureExtension.Builder()
            .setContext(reactContext)
            .setClientHandle(clientHandle)
            .setExtensionScope(ExtensionScope.LOCAL)
            .setListener(mListener)
            .build();
        mCaptureExtension.start();
    }

    @ReactMethod
    public void startCaptureService(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            String serviceStarted = CaptureService.start(context);
            if (serviceStarted.indexOf("success") != -1){
                promise.resolve(serviceStarted);
            } else {
                promise.resolve("Could not start capture service.");
            }
        } catch (Exception e) {
            promise.reject("CAPTURE_SERVICE_ERROR", "Error starting capture service", e);
        }
    }

    public void createExtensionEventAndTrigger(String message, int status){
        SocketCamExtensionEvent ev = new SocketCamExtensionEvent(message, status);
        triggerEvent(ev);
    }

    CaptureExtension.Listener mListener = new CaptureExtension.Listener() {
        @Override
        public void onExtensionStateChanged(ConnectionState connectionState) {
            createExtensionEventAndTrigger("STARTING", 1);
            switch (connectionState.intValue()) {
                case ConnectionState.READY:
                    createExtensionEventAndTrigger("READY", 2);
                    break;
                case ConnectionState.DISCONNECTED:
                createExtensionEventAndTrigger("DISCONNECTED", 0);
                    break;
                default:
                    break;
            }
        }

        @Override
        public void onError(CaptureError error) {
            createExtensionEventAndTrigger("SocketCamExtension ERROR " + error, -1000);
        }
    };

}