"use client";

import React, { useRef } from 'react';
import QrScanner from 'qr-scanner';
import { submitHandler } from './submitHandler';

const QRScanner: React.FC = async () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  function result(result: string) {
    alert(result);
  }
  const startScanner = async () => {
    alert(await QrScanner.hasCamera())
    const qrScanner = new QrScanner(
        videoRef.current!,
        result => submitHandler(result),
        { 
            maxScansPerSecond: 10,
            highlightScanRegion: true,
            highlightCodeOutline: true,
         },
    );
    qrScanner.start();
  };

  return (
    <div className='w-3/5'>
      <video ref={videoRef}></video>
      <button onClick={startScanner}>Start Scanner</button>
    </div>
  );
};

export default QRScanner;
