package com.socketmobile

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.util.Log
import java.util.logging.Logger

internal class CaptureSdkService private constructor() {
    init {
        throw UnsupportedOperationException(
            this.javaClass.name + " is a utility class. Do not instantiate."
        )
    }

    companion object {
        private const val BASE_PACKAGE = "com.socketmobile.capture"
        private const val SERVICE_APP_ID = "com.socketmobile.companion"
        private const val BROADCAST_RECEIVER = BASE_PACKAGE + ".StartService"
        private const val ACTION = BASE_PACKAGE + ".START_SERVICE"
        private const val SERVICE_NAME = BASE_PACKAGE + ".AndroidService"
        private val log = Logger.getLogger(
            CaptureSdkService::class.java.name
        )

        fun getInstallIntent(context: Context): Intent {
            val marketUri = Uri.parse("market://details?id=" + SERVICE_APP_ID)
            val httpUri =
                Uri.parse("https://play.google.com/store/apps/details?id=" + SERVICE_APP_ID)
            val marketIntent = Intent(Intent.ACTION_VIEW, marketUri)
            return if (systemCanHandleIntent(
                    context,
                    marketIntent,
                    PackageManager.MATCH_DEFAULT_ONLY
                )
            ) {
                marketIntent
            } else {
                Intent(Intent.ACTION_VIEW, httpUri)
            }
        }

        @get:SuppressLint("InlinedApi")
        val startIntent: Intent
            get() = Intent(ACTION)
                .setFlags(Intent.FLAG_RECEIVER_FOREGROUND)
                .setComponent(ComponentName(SERVICE_APP_ID, BROADCAST_RECEIVER))

        fun isInstalled(context: Context): Boolean {
            return systemCanHandleBroadcast(context, startIntent, 0)
        }

        fun install(context: Context) {
            context.startActivity(getInstallIntent(context))
        }

        fun start(context: Context): String {
            try {
                val serviceIntent = getExplicitStartIntent(context)
              if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                  context.startForegroundService(serviceIntent)
                  return "successfully started with startForegroundService"
              }
              context.sendBroadcast(startIntent)
            } catch (e: Exception) {
                Log.d(
                    "CaptureService",
                    "Could not start with startForeground Service: " + e.message
                )
                e.printStackTrace()
                context.sendBroadcast(startIntent)
                return "successfully started with sendBroadcast"
            }
            return "Error starting service: Unknown error"
        }

        private fun getExplicitStartIntent(context: Context): Intent {
            return Intent()
                .setComponent(ComponentName(SERVICE_APP_ID, SERVICE_NAME))
        }

        private fun systemCanHandleIntent(ctx: Context, i: Intent, flags: Int): Boolean {
            return ctx.packageManager.queryIntentActivities(i, flags).size > 0
        }

        private fun systemCanHandleBroadcast(ctx: Context, i: Intent, flags: Int): Boolean {
            return ctx.packageManager.queryBroadcastReceivers(i, flags).size > 0
        }
    }
}
