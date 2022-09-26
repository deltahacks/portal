import React from "react";
import { useState } from "react";
import { QrReader } from "react-qr-reader";

const QrScanner: React.FC = () => {
  const [result, setResult] = useState("No result");

  const handleError = (err: Error) => {
    console.error(err);
  };

  const handleScan = (result: string) => {
    if (result) {
      setResult(result);
    }
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="">
      <QrReader
        delay={500}
        style={previewStyle}
        onError={handleError}
        onScan={handleScan}
      />
      <div className="">{result}</div>
    </div>
  );
};

export default QrScanner;
