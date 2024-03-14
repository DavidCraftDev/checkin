"use client";

import React, { useRef } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanner = () => {
    const scanner = new QrScanner(videoRef.current!, result => {
      console.log('QR code scanned:', result);
      // Handle the scanned QR code result here
    });
    scanner.start();
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: '500px' }}></video>
      <button onClick={startScanner}>Start Scanner</button>
    </div>
  );
};

export default QRScanner;
