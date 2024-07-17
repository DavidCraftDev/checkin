"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { submitHandler } from './submitHandler';
import toast from 'react-hot-toast';
import { notFound, useSearchParams } from 'next/navigation';
import { User } from '@prisma/client';

let lastResult: string

function QRScannerComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanner = useCallback(async () => {
    async function handleScanResult(result: QrScanner.ScanResult) {
      if (result.data === lastResult) return;
      lastResult = result.data
      if (!result.data.startsWith("checkin://")) {
        toast.error("Kein Nutzer QR-Code")
        return
      }
      const userID = result.data.replace("checkin://", "")
      const searchParams = useSearchParams();
      const id = searchParams.get('id');
      if (!id) {
        notFound()
      }
      const data: string | User = await submitHandler(userID, id as string)
      console.log(data)
      if (typeof data === "string") {
        if (data === "ErrorNotFound") {
          toast.error("Nutzer nicht gefunden")
        } else if (data === "ErrorAlreadyCheckedIn") {
          toast.error("Nutzer bereits hinzugefügt")
        } else {
          toast.error("Unbekannter Fehler")
        }
      } else {
        if (data.id === userID) {
          toast.success(`${data.displayname} erfolgreich hinzugefügt`)
        } else {
          toast.error("Unbekannter Fehler")
        }
      }
    }

    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        handleScanResult,
        {
          maxScansPerSecond: 10,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );
      qrScanner.start();

      return () => {
        qrScanner.stop();
      };
    }
  }, []);

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
