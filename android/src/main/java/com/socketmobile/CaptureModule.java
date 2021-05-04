package com.socketmobile;

import android.app.Application;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;

import static android.content.Intent.FLAG_RECEIVER_FOREGROUND;

public class CaptureModule extends ReactContextBaseJavaModule {

    private static final String BASE_PACKAGE = "com.socketmobile.capture";
    private static final String SERVICE_APP_ID = "com.socketmobile.companion";
    private static final String BROADCAST_RECEIVER = BASE_PACKAGE + ".StartService";
    private static final String ACTION = BASE_PACKAGE + ".START_SERVICE";
    private final ReactApplicationContext reactContext;

    public CaptureModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "JsonRpcTransport";
    }

    @ReactMethod
    public void startCaptureService(Promise promise) {
        Context context = getReactApplicationContext();
        context.sendBroadcast(getStartIntent());
        promise.resolve(null);
    }

    Intent getStartIntent() {
        return new Intent(ACTION)
                .setFlags(FLAG_RECEIVER_FOREGROUND)
                .setComponent(new ComponentName(SERVICE_APP_ID, BROADCAST_RECEIVER));
    }
}
