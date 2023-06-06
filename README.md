# react-native-capture 1.3.36

This react native module allows a React Native application to use and control Socket Mobile wireless barcode scanners, NFC Reader/Writer, and Camera (iOS only) to capture and deliver data capture to such application.

# Devices compatibility and CaptureSDK versions
|       Devices                                          |          <= 1.2        |          1.3           |
| :----------------------------------------------------: | :--------------------: | :--------------------: |
|   **SocketCam C820**                                   |          ❌            |           ❌           |
|   **S720/D720/S820**                                   |          ❌            |           ✅           |
|   **D600, S550, and all other barcode scanners**       |          ✅            |           ✅           |
|   **S370**                                             |          ❌            |           ❌           |

## Getting started

To install this module to your app environment using NPM:
`$ npm install react-native-capture --save`

using YARN:
`$ yarn add react-native-capture`

## Usage

```javascript

import React, { useState } from 'react';
import {CaptureRn, CaptureEventIds, SktErrors} from 'react-native-capture';

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      status: 'starting',
      message: '--',
    };
    this.onCaptureEvent = this.onCaptureEvent.bind(this);
    this.capture = new CaptureRn();
    this.device = new CaptureRn();
  }

  componentDidMount() {
    const appInfo = {
      appId: 'web:com.socketmobile.reactjs.native.example.example',
      developerId: 'bb57d8e1-f911-47ba-b510-693be162686a',
      appKey:
        'MC0CFQC85w0MsxDng4wHBICX7+iCOiSqfAIUdSerA4/MJ2kYBGAGgIG/YHemNr8=',
    };
    console.log('componentDidMount about to open Capture');
    this.capture
      .open(appInfo, this.onCaptureEvent)
      .then((message) => {
        console.log('captureJS open returns: ', message);
        if (message !== SktErrors.ESKT_NOERROR) {
          message = `Error opening Capture: ${message}`;
        } else {
          message = 'Open capture successful';
        }
        this.setState({
          status: 'Open Capture has returned with: ',
          message,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  onCaptureEvent(e) {
    // case when we receive an empty event (should be fixed in the coming release)
    if (!e) {
      return;
    }
    this.setState({
      status: 'Receive a notification:',
      message: JSON.stringify(e),
    });
    switch (e.id) {
      // when a device is connected to the host
      case CaptureEventIds.DeviceArrival:
        this.device
          .openDevice(e.value.guid, this.capture)
          .then((result) => {
            this.setState({
              status: 'Opening a device:',
              message: `result of opening a device: ${result}`,
            });
          })
          .catch((err) => {
            console.error(err);
          });
        break;
      // when a device is disconnecting from the host
      case CaptureEventIds.DeviceRemoval:
        this.device
          .close()
          .then((result) => {
            this.setState({
              status: 'Closing a device:',
              message: `result of closing a device: ${result}`,
            });
          })
          .catch((err) => {
            console.error(`error closing a device: ${err.message}`);
          });
        break;
      case CaptureEventIds.DecodedData:
        this.setState({
          status: 'Received Decoded Data:',
          message: `source: ${e.value.dataSource.name} length:${e.value.value.length} data: ${e.value.value}`,
        });
        
        break;
    }
  }

...
};
```

## Documentation

More documentation available at [Socket online documentation](https://docs.socketmobile.com/capturejs/en/latest/ "docs.socketmobile.com").
