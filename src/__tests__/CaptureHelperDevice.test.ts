import { CaptureDeviceType } from 'socketmobile-capturejs';
import {
  CaptureHelperDevice,
  CaptureDeviceTypeFunction,
} from '../CaptureHelperDevice';

const makeDevice = (type: number) =>
  new CaptureHelperDevice(
    { name: 'test', guid: 'guid', type, handle: 1 },
    {} as any
  );

describe('CaptureHelperDevice.deviceSupportsFunctions', () => {
  it('reports barcode function for devices encoding Scanner', () => {
    expect(
      CaptureHelperDevice.deviceSupportsFunctions(
        CaptureDeviceType.ScannerS370,
        CaptureDeviceTypeFunction.Scanner
      )
    ).toBe(true);
    expect(
      CaptureHelperDevice.deviceSupportsFunctions(
        CaptureDeviceType.ScannerS370,
        CaptureDeviceTypeFunction.NFCReader
      )
    ).toBe(false);
  });

  it('reports NFC functions for devices encoding NFCReader/NFCWriter', () => {
    expect(
      CaptureHelperDevice.deviceSupportsFunctions(
        CaptureDeviceType.NFCS370,
        CaptureDeviceTypeFunction.NFCReader
      )
    ).toBe(true);
    expect(
      CaptureHelperDevice.deviceSupportsFunctions(
        CaptureDeviceType.NFCS370,
        CaptureDeviceTypeFunction.NFCWriter
      )
    ).toBe(true);
    expect(
      CaptureHelperDevice.deviceSupportsFunctions(
        CaptureDeviceType.NFCS370,
        CaptureDeviceTypeFunction.Scanner
      )
    ).toBe(false);
  });

  it('treats legacy D600 and S550 as NFC reader/writer', () => {
    for (const type of [
      CaptureDeviceType.ScannerD600,
      CaptureDeviceType.ScannerS550,
    ]) {
      expect(
        CaptureHelperDevice.deviceSupportsFunctions(
          type,
          CaptureDeviceTypeFunction.NFCReader
        )
      ).toBe(true);
      expect(
        CaptureHelperDevice.deviceSupportsFunctions(
          type,
          CaptureDeviceTypeFunction.Scanner
        )
      ).toBe(false);
    }
  });

  it('treats other legacy devices as barcode scanners', () => {
    for (const type of [
      CaptureDeviceType.Scanner7,
      CaptureDeviceType.ScannerS700,
      CaptureDeviceType.SocketCamC820,
      CaptureDeviceType.SocketCamC860,
    ]) {
      expect(
        CaptureHelperDevice.deviceSupportsFunctions(
          type,
          CaptureDeviceTypeFunction.Scanner
        )
      ).toBe(true);
      expect(
        CaptureHelperDevice.deviceSupportsFunctions(
          type,
          CaptureDeviceTypeFunction.NFCReader
        )
      ).toBe(false);
    }
  });
});

describe('CaptureHelperDevice.isBarcodeReader / isNFCReader', () => {
  it('identifies barcode readers', () => {
    const device = makeDevice(CaptureDeviceType.ScannerS370);
    expect(device.isBarcodeReader).toBe(true);
    expect(device.isNFCReader).toBe(false);
  });

  it('identifies NFC readers', () => {
    const device = makeDevice(CaptureDeviceType.NFCS370);
    expect(device.isNFCReader).toBe(true);
    expect(device.isBarcodeReader).toBe(false);
  });

  it('identifies the legacy S550 as a NFC reader', () => {
    const device = makeDevice(CaptureDeviceType.ScannerS550);
    expect(device.isNFCReader).toBe(true);
    expect(device.isBarcodeReader).toBe(false);
  });
});
