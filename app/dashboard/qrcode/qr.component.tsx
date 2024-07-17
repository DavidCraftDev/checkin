'use client'

import { useQRCode } from 'next-qrcode';

interface QRCodeProps {
  data: string;
};

const QRCode = ({ data }: QRCodeProps) => {
  const { SVG } = useQRCode();

  return <SVG text={data} />
};

export default QRCode;