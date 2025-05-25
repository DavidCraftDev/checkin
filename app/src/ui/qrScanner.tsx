"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  validate?: (data: string) => boolean;
}

const QRScannerComponent: React.FC<QRScannerProps> = ({ onScan, onError, validate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const lastResultRef = useRef<string | null>(null);

  const startScanner = useCallback(() => {
    async function handleScanResult(result: QrScanner.ScanResult) {
      if (result.data === lastResultRef.current) return;
      lastResultRef.current = result.data;

      const isValid = validate ? validate(result.data) : true;
      if (!isValid) {
        onError?.(new Error("Ungültiger QR-Code"));
        return;
      }

      try {
        onScan(result.data);
      } catch (err) {
        if (err instanceof Error) onError?.(err);
      }
    }

    if (videoRef.current) {
      const scanner = new QrScanner(videoRef.current, handleScanResult, {
        maxScansPerSecond: 10,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      });

      scannerRef.current = scanner;
      scanner.start();
    }
  }, [onScan, onError, validate]);

  useEffect(() => {
    startScanner();

    return () => {
      scannerRef.current?.stop();
    };
  }, [startScanner]);

  return (
    <div className="w-full">
      <video ref={videoRef}></video>
    </div>
  );
};

export default QRScannerComponent;
