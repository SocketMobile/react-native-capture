# React Native CaptureSDK - Version 2.0.24

This React Native module allows a React Native application to use and control Socket Mobile wireless barcode scanners, NFC Reader/Writer, and Camera to capture and deliver data capture to such application.

The React Native CaptureSDK fully supports the React Native new architecture.

## Devices compatibility and CaptureSDK versions

|                    Devices                     | < 2.0 | 2.0 |
| :--------------------------------------------: | :---: | :-: |
|               **SocketCam C860**               |  ✅   | ✅  |
|               **SocketCam C820**               |  ✅   | ✅  |
|               **S720/D720/S820**               |  ✅   | ✅  |
| **D600, S550, and all other barcode scanners** |  ✅   | ✅  |
|                    **S370**                    |  ✅   | ✅  |
|                    **S320**                    |  ✅   | ✅  |
|  **S721 (new Bluetooth LE barcode scanner)**   |  ❌   | ✅  |

## What's new in version 2.0

### CaptureHelper — a simpler way to integrate

Version 2.0 introduces **`CaptureHelper`**, a high-level lifecycle manager that replaces the manual `CaptureRn` + `onCaptureEvent` switch/case pattern. Instead of constructing `CaptureProperty` objects and interpreting raw events yourself, you create a `CaptureHelper` instance with typed callbacks and call named methods.

```typescript
import {
  CaptureHelper,
  type CaptureHelperDevice,
  type AppInfoRn,
  type DecodedData,
  SocketCamTypes,
  BluetoothDiscoveryMode,
  Trigger,
} from 'react-native-capture';

const helper = new CaptureHelper({
  appInfo,
  onDeviceArrival: (device) => console.log(`Connected: ${device.name}`),
  onDeviceRemoval: (device) => console.log(`Disconnected: ${device.name}`),
  onDecodedData: (data, device) => console.log(`Scanned: ${data.data as number[]}`),
  onError: ({ code, message }) => console.error(`Error ${code}: ${message}`),
});

await helper.open();
```

### CaptureHelperDevice — typed device methods

Connected devices are now wrapped in `CaptureHelperDevice` objects that expose typed methods. No more building `CaptureProperty` by hand:

```typescript
// Before (v1.x) — manual property construction
const property = new CaptureProperty(
  CapturePropertyIds.FriendlyNameDevice,
  CapturePropertyTypes.None,
  {},
);
const result = await device.devCapture.getProperty(property);

// After (v2.0) — typed method
const name = await device.getFriendlyName();
```

Available device methods include `getFriendlyName`, `setFriendlyName`, `getBatteryLevel`, `getFirmwareVersion`, `setTrigger`, `getDataSource`, `setDataSource`, `setDataConfirmation`, `getStandConfig`, `setStandConfig`, and more.

### Bluetooth LE device support

Version 2.0 adds support for Bluetooth LE devices such as the **S721**. These devices use a manual discovery flow that the SDK handles for you. See [Connecting Bluetooth LE Devices](#connecting-bluetooth-le-devices).

## Breaking changes from version 1.x

### CaptureHelper is now an instance

`CaptureHelper` was previously a static utility class with methods like `CaptureHelper.setSocketCamEnabled(...)`. It is now an **instance-based lifecycle manager** that must be created with `new CaptureHelper({...})` and opened with `helper.open()`.

### Devices are CaptureHelperDevice objects

Callbacks like `onDeviceArrival` now receive `CaptureHelperDevice` instances instead of raw `CaptureDeviceInfo`. These objects have typed methods (`getFriendlyName()`, `getBatteryLevel()`, etc.) and properties (`name`, `guid`, `type`, `handle`).

The underlying `CaptureRn` instance is still accessible via `device.devCapture` if needed.

### Battery level is a direct percentage

`getBatteryLevel()` now returns a plain number (0–100) instead of a bit-shifted value that required manual decoding.

### Removed interfaces

The following interfaces have been removed: `GetSocketCamEnabledArguments`, `SetSocketCamEnabledArguments`, `SocketCamTriggerButtonData`, `SocketCamStatusOption`, `SocketCamStatusSubOption`.

### Bluetooth LE devices require Companion or in-app discovery

Users who want to use Bluetooth LE readers have two options:

**Option A** — Install the [Socket Mobile Companion app](https://apps.apple.com/app/socket-mobile-companion/id1175638950) which handles discovery and pairing.

**Option B** — Implement the discovery flow in your own UI using the SDK's discovery methods. See [Connecting Bluetooth LE Devices](#connecting-bluetooth-le-devices).

## Installation

```sh
yarn add react-native-capture
```

## Quick start with CaptureHelper

### 1. Create and open CaptureHelper

```typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  CaptureHelper,
  type CaptureHelperDevice,
  type AppInfoRn,
  type DecodedData,
  type DiscoveredDeviceInfo,
  SocketCamTypes,
  BluetoothDiscoveryMode,
  Trigger,
} from 'react-native-capture';

const appInfo: AppInfoRn = {
  appIdIos: 'ios:com.mycompany.myapp',
  appKeyIos: 'MC0C...',
  appIdAndroid: 'android:com.mycompany.myapp',
  appKeyAndroid: 'MC0C...',
  developerId: 'your-developer-id',
};

const App = () => {
  const [devices, setDevices] = useState<CaptureHelperDevice[]>([]);
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [status, setStatus] = useState('Opening Capture...');
  const helperRef = useRef<CaptureHelper | null>(null);

  useEffect(() => {
    const helper = new CaptureHelper({
      appInfo,

      onDeviceArrival: (device) => {
        setDevices(d => [...d, device]);
      },

      onDeviceRemoval: (device) => {
        setDevices(d => d.filter(dd => dd.guid !== device.guid));
      },

      onDecodedData: (data, device) => {
        setDecodedData(data);
      },

      onError: ({ code, message }) => {
        setStatus(`Error ${code}: ${message}`);
      },
    });

    helperRef.current = helper;

    helper
      .open()
      .then(() => setStatus('Capture open'))
      .catch((err) => setStatus(`Failed: ${err?.error?.message}`));

    return () => {
      helper.close().catch(() => {});
    };
  }, []);

  // ...
};
```

### 2. Use typed device methods

Once a device arrives, you can call methods directly on the `CaptureHelperDevice`:

```typescript
const device = devices[0];

// Get device info
const friendlyName = await device.getFriendlyName();
const firmware = await device.getFirmwareVersion();
// firmware: { major, middle, minor, build, year, month, day }

// Battery (returns 0–100 directly)
const battery = await device.getBatteryLevel();

// Trigger a scan
await device.setTrigger(Trigger.Start);

// Enable/disable a symbology
await device.setDataSource(CaptureDataSourceID.SymbologyQRCode, CaptureDataSourceStatus.Enable);
```

### 3. Available CaptureHelper callbacks

```typescript
interface CaptureHelperCallbacks {
  onDeviceArrival?: (device: CaptureHelperDevice) => void;
  onDeviceRemoval?: (device: CaptureHelperDevice) => void;
  onDecodedData?: (data: DecodedData, device: CaptureHelperDevice) => void;
  onSocketCamCanceled?: (device: CaptureHelperDevice) => void;
  onDiscoveredDevice?: (device: DiscoveredDeviceInfo) => void;
  onDiscoveryEnd?: (result: number) => void;
  onBatteryLevel?: (level: number, device: CaptureHelperDevice) => void;
  onPowerState?: (state: PowerState, device: CaptureHelperDevice) => void;
  onButtons?: (state: Notifications, device: CaptureHelperDevice) => void;
  onError?: (error: { code: number; message: string }) => void;
}
```

### 4. Available CaptureHelper methods

```typescript
// Lifecycle
await helper.open();
await helper.close();

// Get connected devices
const devices = helper.getDevices();

// Access the underlying CaptureRn instance (needed for SocketCamViewContainer)
const rootCapture = helper.rootCapture;

// SDK info
const version = await helper.getVersion();

// SocketCam
await helper.setSocketCamEnabled(true);
await helper.getSocketCamEnabled();

// BLE discovery (see next section)
await helper.addBluetoothDevice(BluetoothDiscoveryMode.BluetoothLowEnergy);
await helper.connectDiscoveredDevice(discoveredDevice);
await helper.removeBleDevice(connectedDevice);
```

## Connecting Bluetooth LE Devices

For Bluetooth LE products (S721, D600, S550, S370...) the SDK uses a **manual discovery** flow. With `CaptureHelper`, this is straightforward:

### 1. Discover nearby devices

Call `addBluetoothDevice` on your `CaptureHelper` instance. Each nearby device triggers the `onDiscoveredDevice` callback.

```typescript
const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDeviceInfo[]>([]);

// In your CaptureHelper callbacks:
const helper = new CaptureHelper({
  appInfo,
  onDiscoveredDevice: (device) => {
    setDiscoveredDevices(d => {
      if (d.find(dd => dd.identifierUuid === device.identifierUuid)) return d;
      return [...d, device];
    });
  },
  onDiscoveryEnd: () => {
    setStatus('Discovery finished');
  },
  // ...other callbacks
});

// Start scanning
await helper.addBluetoothDevice(BluetoothDiscoveryMode.BluetoothLowEnergy);
```

### 2. Connect a discovered device

```typescript
const connectDevice = async (device: DiscoveredDeviceInfo) => {
  await helper.connectDiscoveredDevice(device);
  // A successful connection triggers onDeviceArrival with a CaptureHelperDevice
};
```

### 3. Disconnect a device

```typescript
const disconnectDevice = async (device: CaptureHelperDevice) => {
  await helper.removeBleDevice(device);
  // Triggers onDeviceRemoval
};
```

## SocketCam

SocketCam (C820 / C860) lets your app use the device camera as a barcode scanner. In version 2.0, the `SocketCamViewContainer` component handles the native camera view and the SocketCam extension lifecycle.

### Enable SocketCam

```typescript
// Toggle SocketCam on — this triggers a DeviceArrival for the SocketCam virtual device
await helper.setSocketCamEnabled(true);

// The SocketCam device appears in your devices list
const socketCamDevice = devices.find(d => SocketCamTypes.indexOf(d.type) > -1);
```

### SocketCamViewContainer

Import and use the `SocketCamViewContainer` component where you want the camera view:

```jsx
import { SocketCamViewContainer, Trigger, SocketCamTypes } from 'react-native-capture';

<SocketCamViewContainer
  openSocketCamView={openSocketCamView}
  handleSetSocketCamEnabled={handleSetSocketCamEnabled}
  clientOrDeviceHandle={helper.rootCapture?.clientOrDeviceHandle}
  triggerType={Trigger.Start}
  socketCamCapture={helper.rootCapture}
  socketCamDevice={socketCamDevice}
  handleSetStatus={setStatus}
  handleSetSocketCamExtensionStatus={setExtensionStatus}
  socketCamCustomModalStyle={{
    presentationStyle: 'overFullScreen',
    animationType: 'fade',
    transparent: true,
  }}
  socketCamCustomStyle={customStyles}
  androidSocketCamCustomView={<MyCustomAndroidView />}
/>
```

**Android note:** On Android, mount `SocketCamViewContainer` as soon as `helper.rootCapture` is available (before the user enables SocketCam). This starts the SocketCam extension process in the background. Without this, enabling SocketCam returns error `-32 (ESKT_NOTAVAILABLE)`.

For more on SocketCam, [check out the docs](https://docs.socketmobile.com/react-native-capture/en/latest/socketCam.html). For custom views, [read more here](https://docs.socketmobile.com/react-native-capture/en/latest/socketCamCustom.html).

## Migration guide from 1.x to 2.0

### Step 1 — Replace CaptureRn + onCaptureEvent with CaptureHelper

```typescript
// ❌ Before (v1.x)
const capture = new CaptureRn();
await capture.open(appInfo, onCaptureEvent);
// ...then a big switch/case in onCaptureEvent

// ✅ After (v2.0)
const helper = new CaptureHelper({
  appInfo,
  onDeviceArrival: (device) => { /* ... */ },
  onDecodedData: (data, device) => { /* ... */ },
  // ...
});
await helper.open();
```

### Step 2 — Use CaptureHelperDevice methods instead of raw properties

```typescript
// ❌ Before
const prop = new CaptureProperty(CapturePropertyIds.FriendlyNameDevice, CapturePropertyTypes.None, {});
const result = await deviceCapture.getProperty(prop);
const name = result.value;

// ✅ After
const name = await device.getFriendlyName();
```

### Step 3 — Update SocketCam code

```typescript
// ❌ Before
await CaptureHelper.setSocketCamEnabled({ socketCamCapture, ... });

// ✅ After
await helper.setSocketCamEnabled(true);
```

### Step 4 — Use discovery callbacks for BLE devices

```typescript
// ❌ Before — manual DeviceManagerArrival handling, CaptureProperty for AddDevice
// ✅ After
await helper.addBluetoothDevice(BluetoothDiscoveryMode.BluetoothLowEnergy);
// onDiscoveredDevice callback fires for each device found
await helper.connectDiscoveredDevice(discoveredDevice);
```

## Using the low-level API

The low-level `CaptureRn` class and all property types/enums are still exported and can be used directly if you need full control. `CaptureHelper` is the recommended approach for most applications.

## Referencing Socket Mobile's Android CaptureSDK

In your `build.gradle` file, add the Socket Mobile release repo in the `repositories` section:

```groovy
maven {
  url "https://bin.socketmobile.com/repo/releases"
}
```

In your `app/build.gradle`, add:

```groovy
packagingOptions {
  pickFirst '/lib/arm64-v8a/libc++_shared.so'
  pickFirst '/lib/armeabi-v7a/libc++_shared.so'
}
```

## Enable Start Capture Service on Android

To enable Start Capture Service on Android (so that the developer doesn't need to actively run/open Companion), add a network security configuration.

In `your-app/android/app/src/main/res/xml/network_security_config.xml`:

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

In `AndroidManifest.xml`, add to the `<application>` tag:

```xml
android:networkSecurityConfig="@xml/network_security_config"
```

And before the closing `</manifest>` tag:

```xml
<queries>
  <package android:name="com.socketmobile.companion"/>
</queries>
```

For more details, see the [Android docs](https://docs.socketmobile.com/capture/java/en/latest/android/getting-started.html#enable-cleartext-traffic).

## Enabling SocketCam on iOS

In your `Info.plist`, add camera access and the Companion URL scheme:

```xml
<key>NSCameraUsageDescription</key>
<string>Need to enable camera access for SocketCam products</string>

<key>LSApplicationQueriesSchemes</key>
<array>
  <string>sktcompanion</string>
</array>
```

## Documentation

More documentation available at [Socket online documentation](https://docs.socketmobile.com/react-native-capture/en/latest/ 'docs.socketmobile.com').