package com.socketmobile;

import android.annotation.SuppressLint;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import static android.content.Intent.FLAG_RECEIVER_FOREGROUND;

import com.facebook.react.bridge.ReactContext;

import java.util.logging.Logger;

final class CaptureService {
    private static final String BASE_PACKAGE = "com.socketmobile.capture";
    private static final String SERVICE_APP_ID = "com.socketmobile.companion";
    private static final String BROADCAST_RECEIVER = BASE_PACKAGE + ".StartService";
    private static final String ACTION = BASE_PACKAGE + ".START_SERVICE";
    private static final String SERVICE_NAME = BASE_PACKAGE + ".AndroidService";

    private static final Logger log = Logger.getLogger(CaptureService.class.getName());

    private CaptureService() {
        throw new UnsupportedOperationException(
                this.getClass().getName() + " is a utility class. Do not instantiate.");
    }

    static Intent getInstallIntent(Context context) {
        Uri marketUri = Uri.parse("market://details?id=" + SERVICE_APP_ID);
        Uri httpUri = Uri.parse("https://play.google.com/store/apps/details?id=" + SERVICE_APP_ID);

        Intent marketIntent = new Intent(Intent.ACTION_VIEW, marketUri);
        if (systemCanHandleIntent(context, marketIntent, PackageManager.MATCH_DEFAULT_ONLY)) {
            return marketIntent;
        } else {
            return new Intent(Intent.ACTION_VIEW, httpUri);
        }

    }

    @SuppressLint("InlinedApi") static Intent getStartIntent() {
        return new Intent(ACTION)
                .setFlags(FLAG_RECEIVER_FOREGROUND)
                .setComponent(new ComponentName(SERVICE_APP_ID, BROADCAST_RECEIVER));
    }

    static boolean isInstalled(Context context) {
        return systemCanHandleBroadcast(context, getStartIntent(), 0);
    }

    static void install(Context context) {
        context.startActivity(getInstallIntent(context));
    }

    public static String start(Context context) {
        try {
            Intent serviceIntent = getExplicitStartIntent(context);
            if (serviceIntent != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent);
                    return "successfully started with startForegroundService";
                }
                context.sendBroadcast(getStartIntent());
            }
        } catch (Exception e) {
            Log.d("CaptureService", "Could not start with startForeground Service: " + e.getMessage());
            e.printStackTrace();
            context.sendBroadcast(getStartIntent());
            return "successfully started with sendBroadcast";
        }
        return "Error starting service: Unknown error";
    }

    private static Intent getExplicitStartIntent(Context context) {
        return new Intent()
                .setComponent(new ComponentName(SERVICE_APP_ID, SERVICE_NAME));
    }

    private static boolean systemCanHandleIntent(Context ctx, Intent i, int flags) {
        return ctx.getPackageManager().queryIntentActivities(i, flags).size() > 0;
    }

    private static boolean systemCanHandleBroadcast(Context ctx, Intent i, int flags) {
        return ctx.getPackageManager().queryBroadcastReceivers(i, flags).size() > 0;
    }
}

