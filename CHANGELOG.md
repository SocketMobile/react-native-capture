# Changelog

This file tracks released versions with the changes made to this project.

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
