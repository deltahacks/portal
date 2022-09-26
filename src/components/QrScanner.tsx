import React from "react";
import { useState } from "react";
import { QrReader } from "react-qr-reader";

const QrScanner: React.FC = () => {
  const [result, setResult] = useState("No result");

  const handleError = (err: Error) => {
    console.error(err);
  };

  const handleScan = (result: any) => {
    console.log("Result", result);
    if (result) {
      setResult(result.text);
    }
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="">
      <QrReader
        onResult={handleScan}
        constraints={{
          facingMode: "rear",
        }}
      />
      <div className="">{result}</div>
    </div>
  );
};

export default QrScanner;
