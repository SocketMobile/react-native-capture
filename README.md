# react-native-capture 1.4.17

This react native module allows a React Native application to use and control Socket Mobile wireless barcode scanners, NFC Reader/Writer, and Camera (iOS only) to capture and deliver data capture to such application.

# Devices compatibility and CaptureSDK versions

|                    Devices                     | <= 1.2 | 1.3 | 1.4 |
| :--------------------------------------------: | :----: | :-: | :-: |
|               **SocketCam C860**               |   ❌   | ❌  | ❌  |
|               **SocketCam C820**               |   ❌   | ❌  | ✅  |
|               **S720/D720/S820**               |   ❌   | ✅  | ✅  |
| **D600, S550, and all other barcode scanners** |   ✅   | ✅  | ✅  |
|                    **S370**                    |   ❌   | ❌  | ✅  |

## Getting started

To install this module to your app environment using NPM:
`$ npm install react-native-capture --save`

using YARN:
`$ yarn add react-native-capture`

## Usage

```javascript
import React, {useState, useEffect, useRef} from 'react';

import {SafeAreaView, StyleSheet, Text, View, TextInput} from 'react-native';

import {
  CaptureRn,
  CaptureEventIds,
  SktErrors,
  SocketCamTypes,
} from 'react-native-capture';

const App = () => {

  const [capture, setCapture] = useState(new CaptureRn());
  const [useSocketCam, setUseSocketCam] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  // deviceGuidMap is used to keep track of devices already
  // added to the list; meant to prevent adding a device twice
  const [deviceGuidMap, setDeviceGuidMap] = useState({});
  const [batteryLevel, setBatteryLevel] = useState('0%');
  const [status, setStatus] = useState('Opening Capture...');
  const [decodedData, setDecodedData] = useState({
    data: '',
    length: 0,
    name: '',
  });
  const [decodedDataList, setDecodedDataList] = useState([]);
  const [deviceCapture, setDeviceCapture] = useState(null);
  const [bleDeviceManagerCapture, setBleDeviceManagerCapture] = useState(null);
  const [newName, setNewName] = useState('');
  const [socketcamDevice, setSocketCamDevice] = useState(null);
  const [socketCamHandle, setSocketCamHandle] = useState(0);

  // useRef is required to reliably reference component state in a callback
  // that is executed outside of the scope of the component.
  // onCaptureEvent is not called directly by the component, but rather
  // by the capture instance managing events.
  const stateRef = useRef();

  stateRef.current = {
    devices,
    deviceCapture,
    bleDeviceManagerCapture,
    socketcamDevice,
    deviceGuidMap,
  };

  const onCaptureEvent = (e, handle) => {
      if (!e) {
        return;
      }

      myLogger.log(`onCaptureEvent from ${handle}: `, e);
      switch (e.id) {
        case CaptureEventIds.DeviceArrival:
          console.log("ARRIVAL");
          const newDevice = new CaptureRn();
          let {name, guid, type} = e.value;
          let loggedOption = isManager ? 'device manager' : 'device';
          dev
            .openDevice(guid, capture)
            .then((result) => {
              myLogger.log(`opening a ${loggedOption} returns: `, result);
              setStatus(`result of opening ${name} : ${result}`);
              let myMap = {...stateRef.current.deviceGuidMap};
              if (!myMap[guid] && !isManager) {
                dev.guid = guid;
                dev.type = type;
                let device = {
                  guid,
                  name,
                  handle: dev.clientOrDeviceHandle,
                  device: dev,
                };
                let devs = [...stateRef.current.devices, device];
                setDevices(devs);
                myMap[guid] = 1;
                setDeviceGuidMap(myMap);
              }
              if (!isManager) {
                // check for socket cam device type
                if (SocketCamTypes.indexOf(e.value.type) > -1) {
                  setSocketCamHandle(handle);
                  setSocketCamDevice(dev);
                } else {
                  setDeviceCapture(dev);
                }
              } else {
                setBleDeviceManagerCapture(dev);
                getFavorite(dev);
              }
            })
            .catch((res) => {
              var {error} = res;
              const {code, message} = error;
              myLogger.error(resToString(error));
              setStatus(`error opening a device: ${code} \n ${message}}`);
            });
          break;
        case CaptureEventIds.DeviceRemoval:
          let index = devs.findIndex((d) => {
            return d.guid === e.value.guid;
          });

          if (index < 0) {
            myLogger.error(`no matching devices found for ${e.value.name}`);
            return;
          }

          let removeDevice = devs[index];

          myLogger.log('removeDevice: ', removeDevice.name);
          removeDevice.device
            .close()
            .then((result) => {
              myLogger.log('closing a device returns: ', result);
              setStatus(`result of closing ${removeDevice.name}: ${result}`);
              devs = devs.splice(index, 1);
              setDevices(devs);
              let myMap = {...stateRef.current.deviceGuidMap};
              delete myMap[e.value.guid];
              setDeviceGuidMap(myMap);
              if (
                bleDeviceManagerCapture &&
                e.value.guid === bleDeviceManagerCapture.guid
              ) {
                setBleDeviceManagerCapture(null);
              } else {
                setDeviceCapture(null);
                setBatteryLevel('0%');
              }
            })
            .catch((res) => {
              let {error} = res;
              let {message, code} = error;
              myLogger.error(`error closing a device: ${code}: ${message}`);
              setStatus(`error closing a device: ${code}: ${message}`);
            });
            break;
        case CaptureEventIds.DecodedData:
          let dev = stateRef.current.devices.find((d) => d.handle === handle);
          if (dev) {
            setStatus('Decoded Data from ' + dev.name);
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
    }
  ...
};
```

## Upgrading to iOS SDK Version 1.6.39

I needed to deintegrate pods and then re-install them using `pod install --repo-update`. Doing a regular `pod install` gave me the error the below error.

```
[!] CocoaPods could not find compatible versions for pod "CaptureSDK":
  In Podfile:
    react-native-capture (from `../node_modules/react-native-capture`) was resolved to 1.3.37, which depends on
      CaptureSDK (~> 1.6.39)
```

## Using useRef React Hook##

You might encounter memory or state reference issues in your React Native app when trying to access them within the `onCaptureEvent` callback that is passed to the `CaptureRn` instance. This is likely because `onCaptureEvent` is not actually invoked by the component itself but rather as a side effect/listener that is operating in the context of the `CaptureRn` instance. This leads to complex data structures in state, such as arrays and objects, not being reliably accessible.

A workaround to this is to use the `useRef` hook. This will allow you to store various state values in an actual reference value related to the component. This reference can then be accessed in the context that `onCaptureEvent` is operating in. You can add by including it in the general import at the top of your component.

```
import React, {useState, useEffect, useRef} from 'react';
```

Then you can use it after you declare your React Hook state values.

```
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

We are currently working to resolve this. In the meantime, you will need to disconnect and reconnect your scanner (including Socket Cam). This might result in an error, especially after a full reload, in the sample app saying "no matching devices found for DEVICE_NAME". This is normal because the device arrival wasn't triggered so while the device is still connected in the background, the UI doesn't register it.

So when you disconnect it, a remove device event is triggered and picked up by the UI, but the function that finds and removes the device from the device list will throw an error saying the device couldn't be found. At the moment this is normal. Just turn on your device or re-enable Socket Cam and the new device arrival will be detected.

While this work around is not the most convenient for development, _it has no effect on production_. _Android development and production are also not affected_.

## Documentation

More documentation available at [Socket online documentation](https://docs.socketmobile.com/react-native-capture/en/latest/ "docs.socketmobile.com").
