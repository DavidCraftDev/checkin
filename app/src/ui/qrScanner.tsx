// 📱 CLIENT-SIDE MAGIC! Because QR scanning needs the browser! 🌐
"use client";

// 🎪 React hooks and QR scanner imports! Let the scanning begin! 📷
import React, { useCallback, useEffect, useRef } from 'react'; // ⚛️ React hooks galore!
import QrScanner from 'qr-scanner'; // 📸 The QR scanning champion!

// 🎯 Interface for our scanner props - Being specific about what we need! 🎨
interface QRScannerProps {
  onScan: (data: string) => void; // ✅ Success callback - "I found something!"
  onError?: (error: Error) => void; // ❌ Error callback - "Oopsie doopsie!"
  validate?: (data: string) => boolean; // 🔍 Optional validator - "Is this legit?"
}

// 🎬 The main QR Scanner component! Lights, camera, SCAN! 📸
const QRScannerComponent: React.FC<QRScannerProps> = ({ onScan, onError, validate }) => {
  // 🎥 Refs for keeping track of our video element and scanner! 📹
  const videoRef = useRef<HTMLVideoElement>(null); // 📺 The video element ref!
  const scannerRef = useRef<QrScanner | null>(null); // 📷 The scanner instance!
  const lastResultRef = useRef<string | null>(null); // 💾 Remember the last scan to avoid duplicates!

  // 🚀 Start the scanner! Time to hunt for QR codes! 🔍
  const startScanner = useCallback(() => {
    // 🎯 Handle scan results like a pro! 💪
    async function handleScanResult(result: QrScanner.ScanResult) {
      // 🔄 Same as last time? Skip it! No double dipping! 🚫
      if (result.data === lastResultRef.current) return;
      lastResultRef.current = result.data; // 💾 Remember this one!

      // ✅ Validate the QR code if validator provided! Trust but verify! 🔍
      const isValid = validate ? validate(result.data) : true;
      if (!isValid) {
        onError?.(new Error("Ungültiger QR-Code")); // ❌ Invalid QR! Shame! 🔔
        return;
      }

      // 🎉 Valid code! Let's process it! 
      try {
        onScan(result.data); // 📤 Send it to the callback!
      } catch (err) {
        // 💥 Something went wrong! Sound the alarms! 🚨
        if (err instanceof Error) onError?.(err);
      }
    }

    // 🎥 If we have a video element, let's get this party started! 🎊
    if (videoRef.current) {
      // 📸 Create the QR scanner with all the bells and whistles! 🔔
      const scanner = new QrScanner(videoRef.current, handleScanResult, {
        maxScansPerSecond: 10, // 🏃 Scan up to 10 times per second! Speedy! ⚡
        highlightScanRegion: true, // ✨ Highlight the scan region!
        highlightCodeOutline: true, // 🎨 Draw a pretty outline around the code!
      });

      scannerRef.current = scanner; // 💾 Save the scanner instance!
      scanner.start(); // 🎬 ACTION! Start scanning!
    }
  }, [onScan, onError, validate]);

  // 🎪 useEffect - The lifecycle hook that starts it all! 🎢
  useEffect(() => {
    startScanner(); // 🚀 Start scanning when component mounts!

    // 🧹 Cleanup function - Always clean up after yourself! Mom would be proud! 🧽
    return () => {
      scannerRef.current?.stop(); // 🛑 Stop the scanner when component unmounts!
    };
  }, [startScanner]);

  // 🎨 Render the video element! This is where the magic happens! ✨
  return (
    <div className="w-full"> {/* 📏 Full width, because we're generous like that! */}
      <video ref={videoRef}></video> {/* 📹 The star of the show! */}
    </div>
  );
};

export default QRScannerComponent; // 🎁 Export the scanner! Scan away! 📸
