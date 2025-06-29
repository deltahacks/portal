import React, { useRef } from "react";
import { useState, useEffect } from "react";

import { BrowserQRCodeReader, BrowserCodeReader } from "@zxing/browser";

interface QRScannerScanOnceProps {
  callback: (result: string) => void;
}

const QRScannerScanOnce: React.FC<QRScannerScanOnceProps> = ({ callback }) => {
  const parent = useRef<HTMLVideoElement>(null);
  const [cameraIdx, setCameraIdx] = useState(0);

  useEffect(() => {
    const setUpReader = async () => {
      const codeReader = new BrowserQRCodeReader();
      const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();

      if (videoInputDevices === undefined || videoInputDevices.length === 0) {
        console.log("No video input devices found.");
        return;
      }

      // choose the environment camera
      const selectedDeviceId = videoInputDevices[
        cameraIdx % videoInputDevices.length
      ]?.deviceId as string;

      console.log(`cameras: ${videoInputDevices.length}`);
      console.log(`Started decode from camera with id ${selectedDeviceId}`);

      // you can use the controls to stop() the scan or switchTorch() if available
      const result = await codeReader.decodeOnceFromVideoDevice(
        selectedDeviceId,
        parent.current ?? undefined,
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
      }, 100);
      callback(result.getText());
    };

    if (parent.current) {
      setUpReader().then(() => console.log("Camera ready"));
    }

    return () => {
      BrowserCodeReader.releaseAllStreams();
    };
  }, [cameraIdx, callback]);

  return (
    <div>
      <video ref={parent}></video>
      <button
        className="btn btn-primary"
        onClick={() => setCameraIdx(cameraIdx + 1)}
      >
        Flip camera
      </button>
    </div>
  );
};

export default QRScannerScanOnce;
