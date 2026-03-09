"use client";

import QRScannerComponent from '@/app/src/ui/qrScanner';
import { increaseRoundCount } from '@/app/dashboard/modules/sponsorenlauf/handler';
import { toast } from 'sonner';

function QRScanner() {

  async function handleScan(data: string) {
    const result = await increaseRoundCount(data.replace("checkin://", ""));
    if (result) {
      toast.success(result.displayName + " hat eine weitere Runde im ewigen Kreislauf vollendet (" + result.roundCount + ")");
    } else {
      toast.error("Das Wesen wurde in den Akten nicht gefunden — als hätte es nie existiert");
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
