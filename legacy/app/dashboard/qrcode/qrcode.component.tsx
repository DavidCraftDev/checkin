"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

function QRCodeComponent(props: { data: string }) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef || !divRef.current) return;
    QRCode.toString(props.data, { type: "svg", errorCorrectionLevel: "H" }).then((svg) => {
      if (divRef.current) {
        divRef.current.innerHTML = svg;
      }
    }).catch((err) => {
      console.error("Error generating QR code: " + err);
    });
  }, [props.data, divRef]);

  return (
    <div ref={divRef}></div>
  );
}

export default QRCodeComponent;