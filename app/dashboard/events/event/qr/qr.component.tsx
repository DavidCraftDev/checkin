"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { submitHandler } from './submitHandler';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

let lastResult: string

function QRScannerComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const id = useSearchParams().get('id');
  const startScanner = useCallback(async () => {
    const qrScanner = new QrScanner(
      videoRef.current!,
      async result => {
        if (result.data === lastResult) return;
        lastResult = result.data
        if (!result.data.startsWith("checkin://")) {
          toast.error("Kein Nutzer QR-Code")
          return
        }
        const eventID = id
        const userID = result.data.replace("checkin://", "")
        const data: any = await submitHandler(userID, eventID)
        if (data === "ErrorNotFound") {
          toast.error("Nutzer nicht gefunden")
          return
        } else if (data === "ErrorAlreadyCheckedIn") {
          toast.error("Nutzer bereits hinzugefügt")
          return
        } else if (data.id == userID) {
          toast.success(data.displayname + " erfolgreich hinzugefügt")
          return
        } else {
          toast.error("Unbekannter Fehler")
          return
        }
      },
      {
        maxScansPerSecond: 10,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    );
    qrScanner.start();
  }, [id]);
  useEffect(() => {
    startScanner();
  }, [startScanner]);
  return (
    <div className='w-full'>
      <video ref={videoRef}></video>
    </div>
  );
};

export default QRScannerComponent;
