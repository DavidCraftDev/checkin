"use client";

import QRScannerComponent from '@/components/qrScanner';
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { checkinUserHandler, saveTrafficLightFeedback } from './submitHandler';

function QRScanner({ eventID }: { eventID: string }) {
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);

  const handleScan = useCallback(async (data: string) => {
    const result = await checkinUserHandler(data.replace("checkin://", ""), eventID);
    if (typeof result === "string") {
      toast.error(result);
      errorAudioRef.current?.play();
    } else {
      toast.success(`${result.displayName} hinzugefügt!`, {
        description: <TrafficLightSelector eventID={eventID} userID={result.id} />,
        duration: 5000,
      });
      successAudioRef.current?.play();
    }
  }, [eventID]);

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
}

function TrafficLightSelector({ eventID, userID }: { eventID: string; userID: string }) {
  const [selected, setSelected] = useState<string>("GREEN");

  const handleClick = useCallback(async (color: string) => {
    const result = await saveTrafficLightFeedback(eventID, userID, color);
    if (typeof result === "string") {
      toast.error(result);
    } else if (!result.success) {
      toast.error(result.error || "Unbekannter Fehler");
    } else {
      setSelected(color);
    }
  }, [eventID, userID]);


  const colors = [
    { name: "Rot", value: "RED", bg: "bg-red-500" },
    { name: "Gelb", value: "YELLOW", bg: "bg-yellow-400" },
    { name: "Grün", value: "GREEN", bg: "bg-green-500" },
  ];

  return (
    <div className="flex gap-4 mt-4 justify-center flex-wrap">
      {colors.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => handleClick(c.value)}
          className={`
            rounded-full 
            ${c.bg} border-4 shadow-md transition-transform duration-150
            ${selected === c.value ? "border-black scale-110" : "border-transparent"}
            hover:scale-110
            w-8 h-8
            sm:w-10 sm:h-10
            md:w-8 md:h-8
            lg:w-7 lg:h-7
            active:scale-105
          `}
          title={c.name}
        />
      ))}
    </div>
  );
}

export default QRScanner;
