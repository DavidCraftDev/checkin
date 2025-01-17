"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { submitHandler } from './submitHandler';
import toast from 'react-hot-toast';
import { notFound, useSearchParams } from 'next/navigation';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';

let lastResult: string

function QRScannerComponent() {
  const searchParams = useSearchParams();
  let id: string = searchParams.get("id") || "";
  if (!id) notFound();
  const videoRef = useRef<HTMLVideoElement>(null);
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter()

  const checkCamera = async () => {
    if(!await QrScanner.hasCamera()) router.push("/dashboard/events/event?id=" + id)
  }

  useEffect(() => {
    checkCamera();
  }, []);

  const startScanner = useCallback(async () => {
    async function handleScanResult(result: QrScanner.ScanResult) {
      if (result.data === lastResult) return;
      lastResult = result.data
      if (!result.data.startsWith("checkin://")) {
        toast.error("Kein CheckIN QR-Code")
        if (errorAudioRef.current) errorAudioRef.current.play()
        return
      }
      const userID = result.data.replace("checkin://", "")
      const data: string | User = await submitHandler(userID, id)
      console.log(navigator)
      if (typeof data === "string") {
        toast.error(data)
        if (errorAudioRef.current) errorAudioRef.current.play()
      } else {
        if (data.id === userID) {
          toast.success(`${data.displayname} erfolgreich hinzugefügt`)
          if (successAudioRef.current) successAudioRef.current.play()
        } else {
          toast.error("Unbekannter Fehler")
          if (errorAudioRef.current) errorAudioRef.current.play()
        }
      }
    }

    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        handleScanResult,
        {
          maxScansPerSecond: 10,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );
      scanner.start();

      return () => {
        scanner.stop();
      };
    }
  }, [id]);

  useEffect(() => {
    startScanner();
  }, [startScanner]);

  return (
    <div className='w-full'>
      <video ref={videoRef}></video>
      <audio src="/success.mp3" ref={successAudioRef} preload="auto" />
      <audio src="/error.mp3" ref={errorAudioRef} preload="auto" />
    </div>
  );
};

export default QRScannerComponent;
