'use client'

import { useQRCode } from 'next-qrcode';

type QRCodeProps = {
    data: string;
  };
  
  const QRCode = ({ data }: QRCodeProps) => {
    const { Image } = useQRCode();
  
    return (
      <Image
        text={data}
      />
    );
  };
  
  export default QRCode;