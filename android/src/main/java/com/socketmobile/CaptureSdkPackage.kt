package com.socketmobile

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

// New architecture imports
import com.facebook.react.TurboReactPackage
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider


class CaptureSdkPackage : ReactPackage {
    
    // Legacy bridge support
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return if (isNewArchitectureEnabled()) {
            // Return TurboModule for new architecture
            listOf(CaptureSdkTurboModule(reactContext))
        } else {
            // Return legacy module for old architecture
            listOf(CaptureSdkModule(reactContext))
        }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
    
    // Helper method to detect new architecture
    private fun isNewArchitectureEnabled(): Boolean {
        return try {
            Class.forName("com.facebook.react.turbomodule.core.TurboModuleManager")
            true
        } catch (e: ClassNotFoundException) {
            false
        }
    }
}

// TurboReactPackage implementation for new architecture
class CaptureSdkTurboReactPackage : TurboReactPackage() {
    
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == NativeCaptureSdkSpec.NAME) {
            CaptureSdkTurboModule(reactContext)
        } else {
            android.util.Log.d("CaptureSdkTurboReactPackage", "❌ Module name '$name' doesn't match '${NativeCaptureSdkSpec.NAME}'")
            null
        }
    }
    
    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                NativeCaptureSdkSpec.NAME to ReactModuleInfo(
                    NativeCaptureSdkSpec.NAME,
                    CaptureSdkTurboModule::class.java.name,
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    true,  // hasConstants
                    false, // isCxxModule
                    true   // isTurboModule
                )
            )
        }
    }
}
