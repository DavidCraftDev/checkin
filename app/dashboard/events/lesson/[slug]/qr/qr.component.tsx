"use client";

import QRScannerComponent from '@/app/src/ui/qrScanner';
import { toast } from 'sonner';
import { useRef } from 'react';
import { addUserToLesson } from './submitHandler';

function QRScanner({ eventID }: { eventID: string }) {
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);

  async function handleScan(data: string) {
    const result = await addUserToLesson(data.replace("checkin://", ""), eventID);
    if (typeof result === "string") {
      toast.error(result);
      if (errorAudioRef.current) {
        errorAudioRef.current.pause();
        errorAudioRef.current.currentTime = 0;
        errorAudioRef.current.play();
      }
    } else {
      toast.success(`${result.displayname} wurde der Versammlung zugeführt`);
      if (successAudioRef.current) {
        successAudioRef.current.pause();
        successAudioRef.current.currentTime = 0;
        successAudioRef.current.play();
      }
    }
  }

  return (
    <>
      <QRScannerComponent
        onScan={handleScan}
        onError={(error) => toast.error(error.message)}
        validate={(data) => data.startsWith("checkin://")}
      />
      <audio src="/success.mp3" ref={successAudioRef} preload="auto" />
      <audio src="/error.mp3" ref={errorAudioRef} preload="auto" />
    </>
  );
};

export default QRScanner;
