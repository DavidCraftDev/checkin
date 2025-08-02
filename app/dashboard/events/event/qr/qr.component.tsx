"use client";

import QRScannerComponent from '@/app/src/ui/qrScanner';
import React from 'react';
import { toast } from 'sonner';
import { submitHandler } from './submitHandler';

function QRScanner(props: { eventID: string }) {
  const successAudioRef = React.useRef<HTMLAudioElement>(null);
  const errorAudioRef = React.useRef<HTMLAudioElement>(null);

  async function handleScan(data: string) {
    const result = await submitHandler(data.replace("checkin://", ""), props.eventID);
    if (typeof result === "string") {
      toast.error(result);
      errorAudioRef.current?.play();
    } else {
      toast.success(result.displayname + " hinzugefügt!");
      successAudioRef.current?.play();
    }
  }

  return (
    <div>
      <QRScannerComponent
        onScan={handleScan}
        onError={(error) => toast.error(error.message)}
        validate={(data) => data.startsWith("checkin://")}
      />
      <audio src="/success.mp3" ref={successAudioRef} preload="auto" />
      <audio src="/error.mp3" ref={errorAudioRef} preload="auto" />
    </div>
  );
};

export default QRScanner;
