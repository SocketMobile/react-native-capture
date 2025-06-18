# React Natice CaptureSDK - Version 1.5.130

This react native module allows a React Native application to use and control Socket Mobile wireless barcode scanners, NFC Reader/Writer, and Camera to capture and deliver data capture to such application.

## Devices compatibility and CaptureSDK versions

|                    Devices                     | <= 1.2 | 1.3 | 1.4 | 1.5 |
| :--------------------------------------------: | :----: | :-: | :-: | :-: |
|               **SocketCam C860**               |   ❌   | ❌  | ✅  | ✅  |
|               **SocketCam C820**               |   ❌   | ❌  | ✅  | ✅  |
|               **S720/D720/S820**               |   ❌   | ✅  | ✅  | ✅  |
| **D600, S550, and all other barcode scanners** |   ✅   | ✅  | ✅  | ✅  |
|                    **S370**                    |   ❌   | ❌  | ✅  | ✅  |
|                    **S320**                    |   ❌   | ❌  | ❌  | ✅  |

## Installation

We recommend using [Yarn](https://yarnpkg.com) to install this module to your app environment:

```sh
yarn add react-native-capture
```

## How to Use SocketCam

In the latest version, the developer no longer needs to invoke the `startCaptureExtension`, `getSocketCamStatus`, or even construct their own `setProperty` method for setting the SocketCam trigger. They also no longer need to implement `NativeModules` or `DeviceEventEmitter` as this is all taken care of in the new React Native component provided by the React Native CaptureSDK: `SocketCamViewController`. It can be imported from `react-native-capture` and used where you want to employ SocketCam, either C820 or C860.

### SocketCamViewContainer

Once you import this component, it can be used in your app like so.

```xml
  <SocketCamViewContainer
    openSocketCamView={openSocketCamView}
    handleSetSocketCamEnabled={handleSetSocketCamEnabled}
    clientOrDeviceHandle={clientOrDeviceHandle}
    triggerType={triggerType}
    socketCamCapture={socketCamCapture}
    socketCamDevice={socketCamDevice}
    myLogger={myLogger}
    handleSetStatus={handleSetStatus}
    handleSetSocketCamExtensionStatus={handleSetSocketCamExtensionStatus}
    socketCamCustomModalStyle={{
      presentationStyle: 'overFullScreen',
      animationType: 'fade',
      transparent: true,
    }}
    socketCamCustomStyle={SocketCamViewStyles.container}
    androidSocketCamCustomView={
      <RNSocketCamCustomViewManager
        isScanContinuous={triggerType === Trigger.ContinuousScan}
      />
    }
  />
```

SocketCam in your React Native app, you can check out the docs [here](https://docs.socketmobile.com/react-native-capture/en/latest/socketCam.html 'docs.socketmobile.com'). For more information specifically about `SocketCamViewContainer`, you read more [here](https://docs.socketmobile.com/react-native-capture/en/latest/socketCam.html#socketcamviewcontainer.html 'docs.socketmobile.com').

## Custom View finder for SocketCam

The latest version of the React Native CaptureSDK also offers support for customizing the SocketCam view finder in your app. To do this on iOS, you can provide either custom styles for the `socketCamCustomStyle` prop or modal styles for the `socketCamCustomModalStyle` prop.

On Android, you can customize SocketCam by passing a React Native component to the `androidSocketCamCustomView` prop. You will also need to provide your own layout, native view manager, and custom activity.

For more on using custom views for SocketCam, you can read the docs [here](https://docs.socketmobile.com/react-native-capture/en/latest/socketCamCustom.html 'docs.socketmobile.com').

## Referencing Socket Mobile's Android CaptureSDK

In version `>1.5`, we are removing the `android/libs` folder and it's contents. This is because we are now referencing the Socket Mobile Android CaptureSDK via the release repo. The developer will need to add two things. First, in their `build.gradle` file, add the below code, in the `repositories` section.

```groovy
  maven {
    url "https://bin.socketmobile.com/repo/releases"
  }
```

Next, in their `app/build.gradle` file, they will need to add the below code.

```groovy
  packagingOptions {
    pickFirst '/lib/arm64-v8a/libc++_shared.so'
    pickFirst '/lib/armeabi-v7a/libc++_shared.so'
  }
```

## Enable Start Capture Service on Android

In order enable Start Capture Service on Android (so that the developer does't need to actively run/open Companion on the same device), the developer will need to add some security configurations to allow this service to run in the background of their app.

First, in `your-app/android/app/src/main/res`, there needs to be an `xml` directory if there isn't one already. In that directory, you will need to add the file `network_security_config.xml`. That file should contain the below information.

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
    </domain-config>
</network-security-config>
```

Then, in their app's `AndroidManifest.xml` file, the developer will need to add the below property into the `<application>` tag.

```xml
android:networkSecurityConfig="@xml/network_security_config"
```

Finally, add the below line into just before the `AndroidManifest.xml` file's closing `</manifest>` tag.

```xml
<queries>
  <package android:name="com.socketmobile.companion"/>
</queries>
```

For more on the network security configuration for Android, please check out the cleartext section in [the Android docs](https://docs.socketmobile.com/capture/java/en/latest/android/getting-started.html#enable-cleartext-traffic).

## Enabling SocketCam on iOS

In your `Info.plist`, you need to add the key to allow access to the camera. Add the below code to the bottom of your `dict` tag.

```xml
<key>NSCameraUsageDescription</key>
<string>Need to enable camera access for SocketCam products such as C820</string>
```

You also need to add the following key to your `Info.plist`: `LSApplicationQueriesSchemes` (Queried URL Schemes) with a new item: `sktcompanion` (in lower case). See below.

```xml
    <key>LSApplicationQueriesSchemes</key>
    <array>
      <string>sktcompanion</string>
    </array>
```

## Using useRef React Hook

You might encounter memory or state reference issues in your React Native app when trying to access them within the `onCaptureEvent` callback that is passed to the `CaptureRn` instance. This is likely because `onCaptureEvent` is not actually invoked by the component itself but rather as a side effect/listener that is operating in the context of the `CaptureRn` instance. This leads to complex data structures in state, such as arrays and objects, not being reliably accessible.

A workaround to this is to use the `useRef` hook. This will allow you to store various state values in an actual reference value related to the component. This reference can then be accessed in the context that `onCaptureEvent` is operating in. You can add by including it in the general import at the top of your component.

```javascript
import React, { useState, useEffect, useRef } from 'react';
```

Then you can use it after you declare your React Hook state values.

```javascript
const App = () => {
  const [devices, setDevices] = useState([]);

  const stateRef = useRef();

  stateRef.current = devices;

  const onCaptureEvent = (e, handle) => {
    if (!e) {
      return;
    }

    myLogger.log(`onCaptureEvent from ${handle}: `, e);
    let devs = stateRef.current.devices; // HERE is we can check a reliable and up to date list of devices.
    switch (e.id) {
      ...
    }

    ...

};
```

## Documentation

More documentation available at [Socket online documentation](https://docs.socketmobile.com/react-native-capture/en/latest/ 'docs.socketmobile.com').
