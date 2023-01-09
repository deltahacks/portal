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
    // console.log("handling");
    if (newResult === undefined || newResult === null) {
      // console.log("Scanned undefined");
      return;
    }
    const t = newResult.text;
    // play a beep sound

    // call the callback function
    handleScan(t);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <QrReader
      onResult={handleInternalScan}
      scanDelay={1}
      constraints={{
        facingMode: { ideal: "environment" },
      }}
    />
  );
};

export default QrScanner;
