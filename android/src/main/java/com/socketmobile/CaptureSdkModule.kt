package com.socketmobile

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.socketmobile.capture.CaptureError
import com.socketmobile.capture.client.ConnectionState
import com.socketmobile.capture.socketcam.client.CaptureExtension
import com.socketmobile.capture.troy.ExtensionScope

@ReactModule(name = "CaptureSdk")
class CaptureSdkModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {
    private var mCaptureExtension: CaptureExtension? = null
    private var customDeviceHandle: Int? = null
    private var onDeviceHandleReady: ((Int?) -> Unit)? = null

    inner class SocketCamExtensionEvent(var message: String, var status: Int)

    @ReactMethod
    fun triggerEvent(ev: SocketCamExtensionEvent) {
        val eventData = WritableNativeMap()
        eventData.putString("message", ev.message)
        eventData.putInt("status", ev.status)
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("SocketCamExtension", eventData)
    }

    @ReactMethod
    fun addListener(type: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(type: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    override fun getName(): String {
        return "CaptureSdk"
    }

    @ReactMethod
    fun startSocketCamExtension(clientHandle: Int) {
        mCaptureExtension =
                CaptureExtension.Builder()
                        .setContext(reactContext)
                        .setClientHandle(clientHandle)
                        .setExtensionScope(ExtensionScope.LOCAL)
                        .setListener(mListener)
                        .build()
        mCaptureExtension!!.start()
    }

    @ReactMethod
    fun startSocketCamExtensionCustom(clientHandle: Int) {
        mCaptureExtension =
                CaptureExtension.Builder()
                        .setContext(reactContext)
                        .setClientHandle(clientHandle)
                        .setExtensionScope(ExtensionScope.GLOBAL)
                        .setListener(mListener)
                        .setCustomViewListener(
                                object : CaptureExtension.CustomViewListener {
                                    override fun onViewReady(deviceHandle: Int) {
                                        customDeviceHandle = deviceHandle
                                        Log.d(
                                                "deviceHandle in onViewReady: ",
                                                customDeviceHandle.toString()
                                        )
                                        onDeviceHandleReady?.invoke(customDeviceHandle)
                                    }
                                }
                        )
                        .build()

        mCaptureExtension!!.start()
    }

    @ReactMethod
    // This is the method used to pull the custom device handle from onViewReady
    // into the SocketCamView component, which applies it to the custom component if one is
    // supplied.
    fun getCustomDeviceHandle(promise: Promise) {
        // Check if customDeviceHandle is already available
        if (customDeviceHandle != null) {
            promise.resolve(customDeviceHandle)
        } else {
            // If not, store the promise resolver for later
            onDeviceHandleReady = { deviceHandle -> promise.resolve(deviceHandle) }
        }
    }

    @ReactMethod
    fun startCaptureService(promise: Promise) {
        try {
            val context: Context = reactContext
            val serviceStarted = CaptureSdkService.start(context)
            if (serviceStarted.indexOf("success") != -1) {
                Log.v("StartCaptureService", "SUCCESS!")
                promise.resolve(serviceStarted)
            } else {
                Log.v("StartCaptureService", "Could not start!")
                promise.resolve("Could not start capture service.")
            }
        } catch (e: Exception) {
            Log.v("StartCaptureService", "Could not start CATCH!")
            promise.reject("CAPTURE_SERVICE_ERROR", "Error starting capture service", e)
        }
    }

    fun createExtensionEventAndTrigger(message: String, status: Int) {
        val ev = SocketCamExtensionEvent(message, status)
        triggerEvent(ev)
    }

    var mListener: CaptureExtension.Listener =
            object : CaptureExtension.Listener {
                override fun onExtensionStateChanged(connectionState: ConnectionState) {
                    createExtensionEventAndTrigger("STARTING", 1)
                    when (connectionState.intValue()) {
                        ConnectionState.READY -> createExtensionEventAndTrigger("READY", 2)
                        ConnectionState.DISCONNECTED ->
                                createExtensionEventAndTrigger("DISCONNECTED", 0)
                        else -> {}
                    }
                }

                override fun onError(error: CaptureError) {
                    createExtensionEventAndTrigger("SocketCamExtension ERROR $error", -1000)
                }
            }

    companion object {
        private val TAG = CaptureSdkModule::class.java.name
        private const val BASE_PACKAGE = "com.socketmobile.capture"
        private const val SERVICE_APP_ID = "com.socketmobile.companion"
        private const val BROADCAST_RECEIVER = BASE_PACKAGE + ".StartService"
        private const val ACTION = BASE_PACKAGE + ".START_SERVICE"
    }
}
