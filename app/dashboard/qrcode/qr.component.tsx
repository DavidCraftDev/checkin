"use client";

import { useQRCode } from 'next-qrcode';

function QRCodeComponent(props: { data: string }) {
  const { SVG } = useQRCode();
  return <SVG text={props.data} />
}

export default QRCodeComponent;