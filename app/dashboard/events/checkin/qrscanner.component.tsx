"use client"

import React, { useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner: React.FC<{ onScan: (result: string) => void }> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const scanner = new QrScanner(videoRef.current!, result => {
      onScan(result);
      scanner.stop();
    });

    scanner.start().catch(err => console.error('QR Scanner error:', err));

    return () => {
      scanner.destroy();
    };
  }, [onScan]);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%', maxWidth: '500px' }} />
    </div>
  );
};

export default QRScanner;
