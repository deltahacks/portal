import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";

import { BrowserQRCodeReader, BrowserCodeReader } from "@zxing/browser";

interface QRScannerScanOnceProps {
  callback: (result: string) => void;
}

const QRScannerScanOnce: React.FC<QRScannerScanOnceProps> = ({ callback }) => {
  const parent = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setUpReader = async () => {
      const codeReader = new BrowserQRCodeReader();
      const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();

      if (videoInputDevices === undefined || videoInputDevices.length === 0) {
        console.log("No video input devices found.");
        return;
      }
      // choose the environment camera
      const selectedDeviceId = videoInputDevices[0]!.deviceId;

      console.log(`Started decode from camera with id ${selectedDeviceId}`);

      // you can use the controls to stop() the scan or switchTorch() if available
      const result = await codeReader.decodeOnceFromVideoDevice(
        selectedDeviceId,
        parent!.current!
      );
      console.log("Scanned", result);

      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = "square";
      oscillator.frequency.value = 440;
      const gain = audioCtx.createGain();
      gain.gain.value = 3;
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 1000);
      callback(result.getText());
    };

    if (parent.current) {
      setUpReader().then(() => console.log("Camera ready"));
    }
  }, [parent]);

  useEffect(() => {
    return () => {
      BrowserCodeReader.releaseAllStreams();
    };
  });

  return <video ref={parent}></video>;
};

export const QRScanner: React.FC<QRScannerScanOnceProps> = ({ callback }) => {
  const parent = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setUpReader = async () => {
      const codeReader = new BrowserQRCodeReader();
      const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
      let lastFired = new Date(0);

      if (videoInputDevices === undefined || videoInputDevices.length === 0) {
        console.log("No video input devices found.");
        return;
      }
      // choose the environment camera
      const selectedDeviceId = videoInputDevices[0]!.deviceId;

      console.log(`Started decode from camera with id ${selectedDeviceId}`);

      // you can use the controls to stop() the scan or switchTorch() if available
      const controls = codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        parent!.current!,
        (result) => {
          if (result && lastFired.getTime() < Date.now() - 2000) {
            console.log(lastFired);
            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = "square";
            oscillator.frequency.value = 440;
            const gain = audioCtx.createGain();
            gain.gain.value = 1;
            oscillator.connect(gain);
            gain.connect(audioCtx.destination);
            oscillator.start();
            setTimeout(() => {
              oscillator.stop();
            }, 1000);
            console.log("Scanned", result);
            callback(result.getText());

            // bad wait condition
            lastFired = new Date(Date.now());
          }
        }
      );
      // const result = await codeReader.decodeOnceFromVideoDevice(
      //   selectedDeviceId,
      //   parent!.current!
      // );
    };

    if (parent.current) {
      setUpReader().then(() => console.log("Camera ready"));
    }
  }, [parent]);

  return <video ref={parent}></video>;
};

export default QRScannerScanOnce;
