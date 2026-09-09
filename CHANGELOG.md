# Changelog

## Version 2.1.8

### New

  * We have added a new way of connecting to our Bluetooth LE scanners with SM Link and Magic Dock



### Improvements

  * We have updated [Android CaptureSDK to 2.1.8](https://github.com/SocketMobile/android-capturesdk/releases/tag/v2.1.8)

  * We have updated [iOS CaptureSDK to 2.1.22](https://github.com/SocketMobile/cocoapods-capturesdk/releases/tag/2.1.22)



### Bug fixes

  * We have fixed our Changelog including all the past missing versions



## Version 2.0.24

### New

  * N/A


### Improvements

  * We have added the power timers off for our Bluetooth LE devices

  * We have added more description in our CaptureHelper

  * We have updated [iOS CaptureSDK to 2.0.73](https://github.com/SocketMobile/cocoapods-capturesdk/releases/tag/2.0.73)



### Bug fixes

  * We have fixed the [issue enforcing of the Turbo Modules for iOS](https://github.com/SocketMobile/react-native-capture/issues/25)

  * We have fixed the [issue for data confirmation](https://github.com/SocketMobile/react-native-capture/issues/22)


# Version 2.0.16

### New

  * N/A

### Improvements

  * We have update [Android CaptureSDK to 2.0.17](https://github.com/SocketMobile/android-capturesdk/releases/tag/v2.0.17)

  * We have update [iOS CaptureSDK to 2.0.67](https://github.com/SocketMobile/cocoapods-capturesdk/releases/tag/2.0.67)

### Bug fixes

  * We have fixed a [build error on old React Native architecture](https://github.com/SocketMobile/react-native-capture/issues/20)


## Version 2.0.13

### New

  * N/A


### Improvements

  * N/A


### Bug fixes

  * We have fixed the connection and disconnection for Bluetooth LE devices on Android


## Version 2.0.11

### New

  * We have added the support of our brand new scanner Bluetooth Low Energy S721

  * We have added a CaptureHelper to abstract our properties and devices objects

### Improvements

  * We have improved our SocketCam component

  * We have updated [Android CaptureSDK](https://github.com/SocketMobile/android-capturesdk) to `v2.0.1`

  * We have updated [iOS CaptureSDK](https://github.com/SocketMobile/cocoapods-capturesdk) to `v2.0.63`

  * We have updated [CaptureJS](https://github.com/SocketMobile/socketmobile-capturejs) to `v2.0.2`

  * We have updated `react-native` to `v0.83.1` and `react` to `v19.2.0`


## Version 1.5.137

### Improvements

- Updated the [CaptureJS](https://github.com/SocketMobile/socketmobile-capturejs) to `v1.4.3`. Read more about the latest changes on [CaptureJS](https://github.com/SocketMobile/socketmobile-capturejs/releases/tag/1.4.3)

### Fixed

- The [issue #10](https://github.com/SocketMobile/react-native-capture/issues/10) has been fixed. The React Native CaptureSDK now supports fully the new architecture
- The [issue #17](https://github.com/SocketMobile/react-native-capture/issues/17) has been fixed and our [Android SDK](https://github.com/SocketMobile/android-capturesdk) has been updated to support the 16Kb page

## Version 1.5.134

### Improvements

- Updated the [iOS CaptureSDK](https://github.com/SocketMobile/cocoapods-capturesdk) to `v1.9.166`. Read more about the latest changes on [iOS CaptureSDK here](https://github.com/SocketMobile/cocoapods-capturesdk/releases/tag/1.9.166)

### Fixed

- The [issue](https://github.com/SocketMobile/react-native-capture/issues/10) has been fixed. The React Native CaptureSDK now supports fully the new architecture

## Version 1.5.130

### Improvements

- Updated the [iOS CaptureSDK](https://github.com/SocketMobile/cocoapods-capturesdk) to `v1.9.139`.
- On iOS, you can get the `tagId` data so you can get the NFC Tag ID

### Fixed

- The [issue](https://github.com/SocketMobile/react-native-capture/issues/12) has been fixed.

## Version 1.5.124

### Improvements

- Updated `react-native` to support `v0.78.0`.
- Updated `react` to support `v19.0.0`.
- Updated the [iOS CaptureSDK](https://github.com/SocketMobile/cocoapods-capturesdk) to `v1.9.100`.

### Fixed

- Some mistakes in documentation have been fixed.
- iOS native module doesn't include the new architecture directive flag anymore. [Github issue #10](https://github.com/SocketMobile/react-native-capture/issues/10).

## Version 1.5.111

### New

- 🚀 React Native CaptureSDK is back to being public 🚀
- Library name is changed back to `react-native-capture`

### Improvements

- Updated `react-native` to support `v0.75.4`.
- Updated `react` to support `v18.3.1`.
- Updated `socketmobile-capturejs` to `v1.3.50`.
- Updated Gradle to support `v8.8` and new version of React Native.
- Updated the [iOS CaptureSDK](https://github.com/SocketMobile/cocoapods-capturesdk) to `v1.9.74`.
- Updated the Android CaptureSDK to `v1.8.21`.

## Version 1.5.86

### New

- Added the support of SocketCam custom sized view on Android and iOS that the developer can import from `react-native-capture`.
- Added the `SocketCamViewContainer` component that the developer can import from `react-native-capture`.
  - `SocketCamViewContainer` handles much of the SocketCam logic, like starting the SocketCam extension on Android, checking whether or not SocketCam is enabled, and setting the trigger type based on a provided value.
- Added the first iteration of `CaptureHelper` that the developer can import from `react-native-capture`.
  - `CaptureHelper` contains useful functions related to SocketCam for the developer to use so they no longer have to build them from scratch.
- For Android: added a template for providing your own custom view, which includes a layout file to serve as the layout container for `SocketCamFragment`, as well as other Kotlin files specific to the custom view's package, view manager, custom view itself and the associated custom view activity. You can read more about custom views [here](https://docs.socketmobile.com/react-native-capture/en/latest/socketCamCustom.html).
- Updated documentation to include information related to `SocketCamViewContainer`, how to implement custom views for Android and iOS, `CaptureHelper`, and how to enable/disable a symbology.

### Improvements

- Removed any reference of/need for `NativeModules`, `DeviceEventEmitter`, getting whether or not SocketCam is enabled, or setting the SocketCam trigger from the example app.
  - Introduction of the`SocketCamViewContainer` component means the previous Native Module logic is now handled exclusively in the React Native CaptureSDK.

## Version 1.5.64

### Fixed

- On iOS, when you scan a barcode with SocketCam C860, the scanner view is dismissed now.

## Version 1.5.63

### Fixed

- Removed old iOS Native Modules (`NativeCaptureModule.h` and `NativeCaptureModule.m`).

## Version 1.5.57

### Fixed

- Adding `private` field to `package.json` and setting to true as required for use with `workspaces` (Support Issue SM-23242-N1G6M2).
- Changed `src/index` to `lib/module/index` for the `react-native` and `source` properties in the SDK `package.json` file.
- Removed old Java files pertaining to obsolete native modules on the Android side (`CaptureModule.java`, `CapturePackage.java`, `CaptureService.java`).

## Version 1.5.50

### New

- Added support for React Native v0.74.1.
- Updated Native Modules to support new native module architecture.
- Converted SDK and example to use TypeScript and added associated configuration files.
- Updated `example` to use React Native v0.74.1.
- Upgrade to Gradle v8 to coincide with React Native v0.74.1.
- Added `CaptureDeviceInfo` interface to combine the meta data from `DeviceInfo` and the Capture Library Logic of `CaptureRn`.
- Changed `metro.config.js` to use latest syntax (including using `@react-native/metro-config`) in `example`.
- Simplified name of Native Modules from `NativeCaptureModule` to `Capturesdk`.
- Fixed outstanding formatting issues in the official documentation.
- Inclusion of `.xcode.env` and `.xcode.env.local` to serve the `NODE_BINARY` environment variable to XCode project in `example`.

### Improvements

- Updated iOS SDK version to latest (v1.9.32).
- Updated Android SDK version to latest (v1.8.9).
- Converted Android Native Modules from Java to Kotlin.
- Converted iOS Native Modules from Objective-C to C++.

## Version 1.5.20

### New

- Migrated to private repo on Gitlab.
- Added support for SocketCam C860 for iOS.
- Updated `socketmobile-capturejs` to version 1.3.36.
- Updated iOS SDK to version 1.9.4 with support for S320.

## Version 1.4.37

### New

- Implemented Start Capture Service.

### Improvements

- SDK now starts the Capture Service on Android even if the Companion app is not actively running. The service starts the service in the background.

## Version 1.4.28

### New

- Added a changelog.
- Removed references to android/libs .aar and .jar files.

### Improvements

- Added a Changelog.
- Updated Android SDK version to latest (v1.7.39).
- Updated iOS SDK version to latest (v1.8.34).
- Removed references to android/libs .aar and .jar files.

  - For now, developers will need to add the below code their react native app's `repositories` section in their `android/build.gradle` file.

  ```
  maven {
          url "https://bin.socketmobile.com/repo/releases"
      }
  ```

### Bug Fixes

- Moving declaration of `let eventEmitter = new NativeEventEmitter(NativeCaptureModule);`
- Moving declaration of `const subscription = eventEmitter.addListener("onCaptureEvent", onCaptureEvent);`
- Issue #8 on Github.

## Version 1.4.23

### New

- Added support for React v18.

### Improvements

- Added support for React v18.

### Bug Fixes

- N/A

## Version 1.4.17

### New

- Added support for SocketCam C820.

### Improvements

- Added support for SocketCam C820.
- Updated iOS SDK version to latest (v1.6.39).
- Updated `socketmobile-capturejs`` version to latest (v1.3.26).

### Bug Fixes

- N/A
