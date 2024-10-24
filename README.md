# ********************************************************
# THIS REPOSITORY HAS BEEN MOVED BEHIND OUR [DEVELOPERS PORTAL](https://www.socketmobile.com/dev-portal/portal)
# BUT PLEASE WATCH 👁️‍🗨️ ALL ACTIVITY IT AS WE REPORT THE README AND CHANGELOG HERE. YOU'LL BE NOTIFIED WITH:
# - Bug fixes
# - OS version update
# - Support of new products
# ********************************************************

# React Native CaptureSDK 1.5.86

This react native module allows a React Native application to use and control Socket Mobile wireless barcode scanners, NFC Reader/Writer, and Camera to capture and deliver data capture to such application.

The repository has been relocated within the Socket Mobile [Developer Portal](https://www.socketmobile.com/developers/portal) to enhance camera scanning capabilities with the SocketCam C860.

It employs a high-performance decoder capable of swiftly reading damaged barcodes in various lighting conditions.

The new SocketCam C860 is provided to developers at no cost and requires no additional coding efforts if the application includes a UI trigger button.

Activation of the C860 is left to the application's end user, who can enable its use by purchasing a subscription.

It's important to note that the free version of our camera-based scanner, the SocketCam C820, remains accessible.

Both the C860 and C820 utilize the same APIs as our physical scanner products, ensuring a seamless transition between a camera-based scanner and a physical barcode scanner.

More documentation can be found [here](https://docs.socketmobile.com/react-native-capture/en/latest/ "CaptureSDK Documentation").

For more information and how to access, please visit our page [about this new product](https://www.socketmobile.com/readers-accessories/product-families/socketcam).

On 1st of July 2024, there won't be any support for this repository and we will focus on the React Native CaptureSDK hosted through our [DEVELOPERS PORTAL](https://www.socketmobile.com/dev-portal/portal).

# Devices compatibility and CaptureSDK versions

|                    Devices                     | <= 1.2 | 1.3 | 1.4 | 1.5 |
| :--------------------------------------------: | :----: | :-: | :-: | :-: |
|               **SocketCam C860**               |   ❌   | ❌  | ✅  | ✅  |
|               **SocketCam C820**               |   ❌   | ❌  | ✅  | ✅  |
|               **S720/D720/S820**               |   ❌   | ✅  | ✅  | ✅  |
| **D600, S550, and all other barcode scanners** |   ✅   | ✅  | ✅  | ✅  |
|                    **S370**                    |   ❌   | ❌  | ✅  | ✅  |
|                    **S320**                    |   ❌   | ❌  | ❌  | ✅  |

# Getting started

## Installation (New Way)

This NPM package is not referenced on npm.org at the moment because it is hosted on our private repository.

Now you can reference our CaptureSDK by way of the new [private gitlab repo](https://sdk.socketmobile.com/capture/react-native-capturesdk), we can essentially keep the dependency private and re-use the group access token that developers would need to use in order to clone the repo. It is a read only credential that will still allow them to use our SDK without having to create/be given yet another access token.

The syntax for adding the dependency in your `package.json` file can be seen below.

```json
"dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.1",
    "react-native-capturesdk": "https://oauth2:<DEVELOPERS-PORTAL-ACCESS-TOKEN>@sdk.socketmobile.com/capture/react-native-capturesdk.git"
  },
```

Once you have included the SDK this way you can re-run `npm install` or `yarn install`.

## DEPRECATION: For use of older versions of the SDK, please refer to the deprecated installation methods below.

To install this module to your app environment using NPM:
`$ npm install react-native-capturesdk --save`

using YARN:
`$ yarn add react-native-capturesdk`

## Usage

```javascript
import React, {useState, useEffect, useRef} from 'react';

import {SafeAreaView, StyleSheet, Text, View, TextInput} from 'react-native';

import {
  CaptureRn,
  CaptureEventIds,
  SktErrors,
  SocketCamTypes,
} from 'react-native-capturesdk';
const App = () =>{
  const [capture] = useState(new CaptureRn());
  const [useSocketCam, setUseSocketCam] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [devices, setDevices] = useState<CaptureDeviceInfo[]>([]);
  // deviceGuidMap is used to keep track of devices already
  // added to the list; meant to prevent adding a device twice
  const [deviceGuidMap, setDeviceGuidMap] = useState<DeviceGuidMap>({});
  const [status, setStatus] = useState<string>('Opening Capture...');
  const [decodedData, setDecodedData] = useState<DecodedData>({
    data: '',
    length: 0,
    name: '',
  });
  const [decodedDataList, setDecodedDataList] = useState<DecodedData[] | []>(
    [],
  );
  const [deviceCapture, setDeviceCapture] = useState<CaptureRn | null>(null);
  const [bleDeviceManagerCapture, setBleDeviceManagerCapture] =
    useState<CaptureRn | null>(null);
  const [socketCamDevice, setSocketCamDevice] =
    useState<CaptureDeviceInfo | null>(null);
  const [isContinuousTrigger, setIsContinuousTrigger] =
    useState<boolean>(false);
  const [os, setOs] = useState<boolean>(false);
  const [openSocketCamView, setOpenSocketCamView] = useState<boolean>(false);
  // useRef is required to reliably reference component state in a callback
  // that is executed outside of the scope of the component.
  // onCaptureEvent is not called directly by the component, but rather
  // by the capture instance managing events.
  const stateRef = useRef<StateData>(initialState);

  stateRef.current = {
    devices,
    deviceCapture,
    bleDeviceManagerCapture,
    socketCamDevice,
    deviceGuidMap,
    isContinuousTrigger,
    os,
  };

  const onCaptureEvent = (e: CaptureEvent<any>, handle: number) => {
    if (!e) {
      return;
    }

    myLogger.log(`onCaptureEvent from ${handle}: `, e);
    let devs: CaptureDeviceInfo[] = [...stateRef.current.devices];
    switch (e.id) {
      case CaptureEventIds.DeviceArrival:
        const newDevice = new CaptureRn();
        openDeviceHelper(newDevice, e, false);
        break;
      case CaptureEventIds.DeviceRemoval:
        let index = devs.findIndex((d: CaptureDeviceInfo) => {
          return d.guid === e.value.guid;
        });
        if (index < 0) {
          myLogger.error(`no matching devices found for ${e.value.name}`);
          return;
        } else {
          let removeDevice = devs[index];
          myLogger.log('removeDevice: ', removeDevice?.name);
          removeDevice!.devCapture
            .close()
            .then((result: number) => {
              myLogger.log('closing a device returns: ', `${result}`);
              setStatus(`result of closing ${removeDevice?.name}: ${result}`);
              devs.splice(index, 1);
              setDevices(devs);
              let myMap = {...stateRef.current.deviceGuidMap};
              delete myMap[e.value.guid];
              setDeviceGuidMap(myMap);
              let bleDeviceManagerCaptureDev =
                bleDeviceManagerCapture as CaptureDeviceInfo;
              if (
                bleDeviceManagerCaptureDev &&
                e.value.guid === bleDeviceManagerCaptureDev.guid
              ) {
                setBleDeviceManagerCapture(null);
              } else {
                setDeviceCapture(null);
              }
            })
            .catch((res: JRpcError) => {
              let {error} = res;
              let {message, code} = error;
              // The error code -38 is related to SocketCam extension closing the SocketCam device when you DISABLE SocketCam on android.
              // When you disable SocketCam, it closes the device via the extension so there is no need to close it in the React Native side.
              // It will not show up with other devices and therefore can be ignored.
              // Other error codes must be handled accordingly.
              if (code !== -38) {
                myLogger.error(`error closing a device: ${code}: ${message}`);
                setStatus(`error closing a device: ${code}: ${message}`);
              }
            });
        }
        break;
      case CaptureEventIds.DecodedData:
        let devWithInfo = stateRef.current.devices.find(
          (d: CaptureDeviceInfo) => {
            return d.handle === handle;
          },
        );

        if (devWithInfo) {
          setStatus('Decoded Data from ' + devWithInfo.name);
          if (e?.result === SktErrors.ESKT_CANCEL) {
            setOpenSocketCamView(false);
            // return here because we don't add this to the decodedDataList as it's a cancel event not a data scan.
            return;
          }
          if (!stateRef.current.os) {
            if (
              SocketCamTypes.indexOf(devWithInfo.type) > -1 &&
              !stateRef.current.isContinuousTrigger
            ) {
              setOpenSocketCamView(false);
            }
          }
        } else {
          setStatus('Decoded Data!');
        }
        setDecodedDataList((prevList) => {
          const newDecodedData = {...lastDecodedData};
          newDecodedData.id = prevList.length + 1;
          return [newDecodedData, ...prevList];
        });
        lastDecodedData = {
          data: arrayToString(e.value.data),
          length: e.value.data.length,
          name: e.value.name,
          id: -1, //number placeholder
        };
        setDecodedData(lastDecodedData);
        break;
      case CaptureEventIds.DeviceManagerArrival:
        const newBleDeviceManager = new CaptureRn();
        openDeviceHelper(newBleDeviceManager, e, true);
        break;
      case CaptureEventIds.DeviceManagerRemoval:
        setBleDeviceManagerCapture(null);
        break;
      default:
        console.log('DEFAULT');
        break;
    }
  };
  ...
  const openDeviceHelper = (
    dev: CaptureRn,
    e: CaptureEvent<any>,
    isManager: boolean,
  ) => {
    let {name, guid, type} = e.value;
    let loggedOption = isManager ? 'device manager' : 'device';
    dev
      .openDevice(guid, capture)
      .then((result: number) => {
        myLogger.log(`opening a ${loggedOption} returns: `, `${result}`);
        setStatus(`result of opening ${name} : ${result}`);
        let myMap = {...stateRef.current.deviceGuidMap};
        if (!myMap[guid] && !isManager) {
          let device = genDevice(dev, guid, name, type);
          let devs = [...stateRef.current.devices, device];
          setDevices(devs);
          myMap[guid] = '1';
          setDeviceGuidMap(myMap);
        }
        if (!isManager) {
          // check for SocketCam device type
          if (SocketCamTypes.indexOf(e.value.type) > -1) {
            let device = genDevice(dev, guid, name, type);
            setSocketCamDevice(device);
          } else {
            setDeviceCapture(dev);
          }
        } else {
          setBleDeviceManagerCapture(dev);
          getFavorite(dev);
        }
      })
      .catch((res: JRpcError) => {
        let {error} = res;
        const {code, message} = error;
        myLogger.error(resToString(error));
        setStatus(`error opening a device: ${code} \n ${message}}`);
      });
  };
};
```

## How to Use SocketCam (SocketCamViewContainer)

In the latest version, the developer no longer needs to invoke the `startCaptureExtension`, `getSocketCamStatus`, or even construct their own `setProperty` method for setting the SocketCam trigger. They also no longer need to implement `NativeModules` or `DeviceEventEmitter` as this is all taken care of in the new React Native component provided by the React Native CaptureSDK: `SocketCamViewController`. It can be imported from `react-native-capturesdk` and used where you want to employ SocketCam, either C820 or C860.

### SocketCamViewContainer

Once you import this component, it can be used in your app like so.

```javascript
  <SocketCamViewContainer
            openSocketCamView={openSocketCamView}
            handleSetSocketCamEnabled={handleSetSocketCamEnabled}
            clientOrDeviceHandle={clientOrDeviceHandle}
            triggerType={triggerType}
            socketCamCapture={socketCamCapture}
            socketCamDevice={socketCamDevice}
            myLogger={myLogger}
            handleSetStatus={handleSetStatus}
            handleSetSocketCamExtensionStatus={
              handleSetSocketCamExtensionStatus
            }
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

## Custom Views for SocketCam

The latest version of the React Native CaptureSDK also offers support for customizing the SocketCam view finder in your app! To do this on iOS, you can provide either custom styles for the `socketCamCustomStyle` prop or modal styles for the `socketCamCustomModalStyle` prop.

On Android, you can customize SocketCam by passing a React Native component to the `androidSocketCamCustomView` prop. You will also need to provide your own layout, native view manager, and custom activity. 

For more on using custom views for SocketCam, you can read the docs [here](https://docs.socketmobile.com/react-native-capture/en/latest/socketCamCustom.html 'docs.socketmobile.com').

## Referencing Socket Mobile's Android SDK

In version `>1.4.23`, we are removing the `android/libs` folder and it's contents. This is because we are now referencing the Socket Mobile Android SDK via the release repo. The developer will need to add two things. First, in their `build.gradle` file, add the below code, in the `repositories` section.

```
  maven {
          url "https://bin.socketmobile.com/repo/releases"
      }
```

Next, in their `app/gradle.build` file, they will need to add the below code.

```
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

## Accessing the latest iOS SDK from the private repo

In order to access the latest iOS SDK, you will need to add the private repo as a dependency. This can be done by adding the below line into your app's Podfile.

```ruby
source "https://oauth2:<DEVELOPERS-PORTAL-ACCESS-TOKEN>@sdk.socketmobile.com/capture/cocoapods-repo.git"
```

Be sure to run a new pod install --repo-update after updating your pod file.

## Enabling SocketCam C860

For SocketCam C860 which is an enhanced version of SocketCam C820, you also need to add the following key to your `Info.plist`: `LSApplicationQueriesSchemes` (Queried URL Schemes) with a new item: `sktcompanion` (in lower case). See below.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
	<dict>
  ...
  ...
      <key>LSApplicationQueriesSchemes</key>
		  <array>
			  <string>sktcompanion</string>
		  </array>
	</dict>
</plist>
```

## Using useRef React Hook

You might encounter memory or state reference issues in your React Native app when trying to access them within the `onCaptureEvent` callback that is passed to the `CaptureRn` instance. This is likely because `onCaptureEvent` is not actually invoked by the component itself but rather as a side effect/listener that is operating in the context of the `CaptureRn` instance. This leads to complex data structures in state, such as arrays and objects, not being reliably accessible.

A workaround to this is to use the `useRef` hook. This will allow you to store various state values in an actual reference value related to the component. This reference can then be accessed in the context that `onCaptureEvent` is operating in. You can add by including it in the general import at the top of your component.

```typescript
import React, {useState, useEffect, useRef} from 'react';
```

Then you can use it after you declare your React Hook state values.

```typescript
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

## Note on Hot Reload for iOS

Right now there is an issue when using an iOS device where the hot reload provided by react doesn't lead to the full chain of events of the previous app state. For example, if you opened capture, then connected a device, if you were to save your code or reload your app entirely, then the only event picked up on the device will be the open capture.

We are currently working to resolve this. In the meantime, you will need to disconnect and reconnect your scanner (including SocketCam). This might result in an error, especially after a full reload, in the sample app saying "no matching devices found for DEVICE_NAME". This is normal because the device arrival wasn't triggered so while the device is still connected in the background, the UI doesn't register it.

So when you disconnect it, a remove device event is triggered and picked up by the UI, but the function that finds and removes the device from the device list will throw an error saying the device couldn't be found. At the moment this is normal. Just turn on your device or re-enable SocketCam and the new device arrival will be detected.

While this work around is not the most convenient for development, _it has no effect on production_. _Android development and production are also not affected_.

## Documentation

More documentation available at [Socket online documentation](https://docs.socketmobile.com/react-native-capture/en/latest/ 'docs.socketmobile.com').
