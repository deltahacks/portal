import React, { useRef } from "react";
import { useState, useEffect } from "react";

import { BrowserCodeReader } from "@zxing/browser";

interface QRScannerProps {
  callback: (result: string) => void;
  delay: number;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  callback,
  delay = 2000,
}) => {
  const parent = useRef<HTMLVideoElement>(null);
  const [cameraIdx, setCameraIdx] = useState(0);

  useEffect(() => {
    const setUpReader = async () => {
      const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();

      if (videoInputDevices === undefined || videoInputDevices.length === 0) {
        console.log("No video input devices found.");
        return;
      }
      // choose the environment camera
      const selectedDeviceId = videoInputDevices[
        cameraIdx % videoInputDevices.length
      ]?.deviceId as string;

      console.log(`Started decode from camera with id ${selectedDeviceId}`);

      // you can use the controls to stop() the scan or switchTorch() if available
      // const controls = codeReader.decodeFromVideoDevice(
      //   selectedDeviceId,
      //   parent!.current!,
      //   (result) => {
      //     if (result && lastFired.getTime() < Date.now() - delay) {
      //       console.log(lastFired);
      //       const audioCtx = new AudioContext();
      //       const oscillator = audioCtx.createOscillator();
      //       oscillator.type = "square";
      //       oscillator.frequency.value = 440;
      //       const gain = audioCtx.createGain();
      //       gain.gain.value = 1;
      //       oscillator.connect(gain);
      //       gain.connect(audioCtx.destination);
      //       oscillator.start();
      //       setTimeout(() => {
      //         oscillator.stop();
      //       }, 200);
      //       console.log("Scanned", result);
      //       callback(result.getText());

      //       // bad wait condition
      //       lastFired = new Date(Date.now());
      //     }
      //   }
      // );
    };

    if (parent.current) {
      setUpReader().then(() => console.log("Camera ready"));
    }

    return () => {
      BrowserCodeReader.releaseAllStreams();
    };
  }, [callback, delay, cameraIdx]);

  return (
    <div>
      <video ref={parent}></video>
      <button
        className="btn btn-primary"
        onClick={() => (
          setCameraIdx(cameraIdx + 1),
          console.log(cameraIdx % 2)
        )}
      >
        Flip camera
      </button>
    </div>
  );
};

export default QRScanner;
