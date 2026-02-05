"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('environment');

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

    if (videoRef.current && !scannerRef.current) {
      const scanner = new QrScanner(videoRef.current, handleScanResult, {
        maxScansPerSecond: 10,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment', 
      });

      scannerRef.current = scanner;
      
      scanner.start()
        .then(() => QrScanner.listCameras(true))
        .then(setCameras)
        .catch(err => {
             if (onError && err instanceof Error) onError(err);
        });
    }
  }, [onScan, onError, validate]);

  useEffect(() => {
    startScanner();

    return () => {
      scannerRef.current?.stop();
      scannerRef.current = null;
    };
  }, [startScanner]);

  const handleCameraChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedCamera(deviceId);
    await scannerRef.current?.setCamera(deviceId);
  };

  return (
    <div className="w-full relative">
      <video ref={videoRef} className="block w-full rounded-lg"></video>
      {cameras.length > 1 && (
        <div className="absolute top-2 right-2">
            <select
              value={selectedCamera}
              onChange={handleCameraChange}
              className="bg-white/90 text-black text-sm p-1 rounded border border-gray-300 shadow-sm outline-none"
            >
              <option value="environment" disabled>Kamera wählen</option>
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </select>
        </div>
      )}
    </div>
  );
};

export default QRScannerComponent;
