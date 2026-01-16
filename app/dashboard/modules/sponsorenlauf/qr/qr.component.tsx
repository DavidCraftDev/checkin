"use client";

import QRScannerComponent from '@/components/qrScanner';
import React from 'react';
import { increaseRoundCount } from '../handler';
import { toast } from 'sonner';

function QRScanner() {

  async function handleScan(data: string) {
    const result = await increaseRoundCount(data.replace("checkin://", ""));
    if (result) {
      toast.success(result.displayName + " +1 Runde (" + result.roundCount + ")");
    } else {
      toast.error("Nutzer nicht gefunden!");
    }
  }

  return (
    <div>
      <QRScannerComponent
        onScan={handleScan}
        onError={(error) => toast.error(error.message)}
        validate={(data) => data.startsWith("checkin://")}
      />
    </div>
  );
};

export default QRScanner;
