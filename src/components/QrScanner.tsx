import React from "react";
import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";

// function that takes a callback function as an argument
// the callback function is called when the QR code is scanned
// the type of the callback function is (result: string) => void

interface QRScannerProps {
  handleScan: (result: string) => void;
}

const QrScanner: React.FC<QRScannerProps> = ({ handleScan }) => {
  const [scanned, setScanned] = useState(0);

  const handleError = (err: Error) => {
    console.error(err);
  };

  const [scanValue, setScanValue] = useState(undefined);

  const eff = useEffect(() => {
    if (scanValue === undefined) {
      return;
    }

    setScanned((scanned) => scanned + 1);
  }, [scanValue]);

  const handleInternalScan = (newResult: any) => {
    if (newResult === undefined || newResult === null) {
      return;
    }
    const t = newResult.text;

    if (t === scanValue) {
      return;
    }

    console.log(t);
    setScanValue(t);
    setScanned((scanned) => scanned + 1);

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

    handleScan(t);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="">
      <h1 className="text-4xl">{scanned} Scanned </h1>
      <h2>{scanValue}</h2>
      <QrReader
        onResult={handleInternalScan}
        scanDelay={10}
        constraints={{
          facingMode: { ideal: "environment" },
        }}
      />
    </div>
  );
};

export default QrScanner;
