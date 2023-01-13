import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";

// function that takes a callback function as an argument
// the callback function is called when the QR code is scanned
// the type of the callback function is (result: string) => void

interface QRScannerProps {
  handleScan: (result: string) => void;
  lastVal?: string;
  scanDelay: number | boolean;
}

const QrScanner: React.FC<QRScannerProps> = ({
  handleScan,
  lastVal,
  scanDelay,
}) => {
  const [any, setA] = useState<boolean>(false);
  const handleError = (err: Error) => {
    console.error(err);
  };

  const parent = useRef(null);

  useEffect(() => {
    if (parent) {
      const p = parent.current as any;
      if (p) {
        console.log(p);
      }
    }
  }, [parent]);

  const handleInternalScan = (newResult: any) => {
    if (any) {
      return;
    }
    if (newResult === undefined || newResult === null) {
      return;
    }
    const t = newResult.text;

    // console.log("lastVal", lastVal, t);
    if (t === lastVal) {
      return;
    }

    // const audioCtx = new AudioContext();
    // const oscillator = audioCtx.createOscillator();
    // oscillator.type = "square";
    // oscillator.frequency.value = 800;
    // const gain = audioCtx.createGain();
    // gain.gain.value = 3;
    // oscillator.connect(gain);
    // gain.connect(audioCtx.destination);
    // oscillator.start();
    // setTimeout(() => {
    //   oscillator.stop();
    // }, 350);

    setA(true);
    handleScan(t);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="">
      <QrReader
        ref={parent}
        onResult={handleInternalScan}
        scanDelay={scanDelay as any} // VERY HACKY VERY HACKY this is terrible code. too bad!
        constraints={{
          facingMode: { ideal: "environment" },
        }}
      />
    </div>
  );
};

export default QrScanner;
