package com.socketmobile;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.socketmobile.capture.CaptureError;
import com.socketmobile.capture.client.ConnectionState;
import com.socketmobile.capture.socketcam.client.CaptureExtension;
import com.socketmobile.capture.troy.ExtensionScope;


/**
 * TurboModule implementation for CaptureSdk
 * This class provides the new architecture implementation while maintaining compatibility
 */
public class CaptureSdkTurboModule extends NativeCaptureSdkSpec {
    
    private static final String TAG = "CaptureSdk";
    
    private CaptureExtension mCaptureExtension;
    private Integer customDeviceHandle;
    private OnDeviceHandleReadyCallback onDeviceHandleReady;
    
    // Callback interface for device handle
    private interface OnDeviceHandleReadyCallback {
        void onReady(Integer deviceHandle);
    }
    
    // Inner class for SocketCam extension events
    private static class SocketCamExtensionEvent {
        final String message;
        final int status;
        
        SocketCamExtensionEvent(String message, int status) {
            this.message = message;
            this.status = status;
        }
    }
    
    public CaptureSdkTurboModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.i(TAG, "New architecture - TurboModule initialized ✅");
    }
    
    @NonNull
    public String getName() {
        return NAME;
    }
    
    @ReactMethod
    public void startCaptureService(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            String serviceStarted = CaptureSdkService.Companion.start(context);
            if (serviceStarted.contains("success")) {
                promise.resolve(serviceStarted);
            } else {
                Log.v(TAG, "StartCaptureService Could not start!");
                promise.resolve("Could not start capture service.");
            }
        } catch (Exception e) {
            Log.v(TAG, "StartCaptureService Could not start CATCH!");
            promise.reject("CAPTURE_SERVICE_ERROR", "Error starting capture service", e);
        }
    }
    
    @ReactMethod
    public void openTransport(String host, Promise promise) {
        // Create transport handle (simulated)
        WritableNativeMap transport = new WritableNativeMap();
        WritableNativeMap handle = new WritableNativeMap();
        handle.putInt("handle", System.identityHashCode(this));
        transport.putMap("transport", handle);
        promise.resolve(transport);
    }
    
    @ReactMethod
    public void closeTransport(double handle, Promise promise) {
        String result = (long)handle + " closed";
        promise.resolve(result);
    }
    
    @ReactMethod
    public void sendTransport(double handle, String jsonRpc, Promise promise) {
        // For TurboModule, we would implement the actual JSON-RPC handling here
        // This is a placeholder that returns the same jsonRpc for compatibility
        try {
            // In a real implementation, you would parse and handle the JSON-RPC
            promise.resolve(jsonRpc);
        } catch (Exception e) {
            promise.reject("SEND_TRANSPORT_ERROR", "Error sending transport", e);
        }
    }
    
    @ReactMethod
    public void getTargetView(double reactTag) {
        // Not used for Android
    }
    
    @ReactMethod
    public void dismissViewController() {
        // Not used for Android
    }
    
    @ReactMethod
    public void startSocketCamExtension(double clientHandle) {
        int handle = (int)clientHandle;
        try {
            mCaptureExtension = new CaptureExtension.Builder()
                    .setContext(getReactApplicationContext())
                    .setClientHandle(handle)
                    .setExtensionScope(ExtensionScope.LOCAL)
                    .setListener(mListener)
                    .build();
            mCaptureExtension.start();
        } catch (Exception e) {
            Log.e(TAG, "Error starting SocketCam extension", e);
        }
    }
    
    @ReactMethod
    public void startSocketCamExtensionCustom(double clientHandle) {
        int handle = (int)clientHandle;
        try {
            mCaptureExtension = new CaptureExtension.Builder()
                    .setContext(getReactApplicationContext())
                    .setClientHandle(handle)
                    .setExtensionScope(ExtensionScope.GLOBAL)
                    .setListener(mListener)
                    .setCustomViewListener(new CaptureExtension.CustomViewListener() {
                                        public void onViewReady(int deviceHandle) {
                            customDeviceHandle = deviceHandle;
                            if (onDeviceHandleReady != null) {
                                onDeviceHandleReady.onReady(customDeviceHandle);
                            }
                        }
                    })
                    .build();
            mCaptureExtension.start();
        } catch (Exception e) {
            Log.e(TAG, "Error starting SocketCam extension CUSTOM", e);
        }
    }
    
    @ReactMethod
    public void getCustomDeviceHandle(Promise promise) {
        if (customDeviceHandle != null) {
            promise.resolve(customDeviceHandle);
        } else {
            // Store the promise resolver for later
            onDeviceHandleReady = deviceHandle -> promise.resolve(deviceHandle);
        }
    }
    
    @ReactMethod
    public void addListener(String eventType) {
        // Required for RN built-in Event Emitter Calls
    }
    
    @ReactMethod
    public void removeListeners(double count) {
        // Required for RN built-in Event Emitter Calls
    }
    
    // Helper method to send events to JavaScript
    private void sendEvent(String eventName, WritableNativeMap data) {
        try {
            getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
        } catch (Exception e) {
            Log.e(TAG, "Error sending event: " + eventName, e);
        }
    }
    
    // Helper method to create and trigger extension events
    public void createExtensionEventAndTrigger(String message, int status) {
        int statusInt = (int)status;
        WritableNativeMap eventData = new WritableNativeMap();
        eventData.putString("message", message);
        eventData.putInt("status", statusInt);
        
        try {
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("SocketCamExtension", eventData);
        } catch (Exception e) {
            Log.e(TAG, "Error emitting SocketCamExtension event", e);
        }
    }
    
    // CaptureExtension listener implementation
    private final CaptureExtension.Listener mListener = new CaptureExtension.Listener() {
            public void onExtensionStateChanged(ConnectionState connectionState) {
            
            switch (connectionState.intValue()) {
                case ConnectionState.READY:
                    createExtensionEventAndTrigger("READY", 2);
                    break;
                case ConnectionState.DISCONNECTED:
                    Log.d(TAG, "SocketCam extension DISCONNECTED");
                    createExtensionEventAndTrigger("DISCONNECTED", 0);
                    break;
                default:
                    Log.d(TAG, "SocketCam extension OTHER STATE (state: " + connectionState.intValue() + ")");
                    // Send appropriate event based on the state
                    if (connectionState.intValue() == 2) {
                        createExtensionEventAndTrigger("READY", 2);
                    } else {
                        createExtensionEventAndTrigger("STARTING", 1);
                    }
                    break;
            }
        }
        
            public void onError(CaptureError error) {
            Log.e(TAG, "SocketCam extension error: " + error);
            createExtensionEventAndTrigger("SocketCamExtension ERROR " + error, -1000);
        }
    };
}
