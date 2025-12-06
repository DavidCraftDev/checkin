"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

function QRCodeComponent(props: { data: string }) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef || !divRef.current) return;
    QRCode.toString(props.data, { type: "svg", errorCorrectionLevel: "H" }).then((svg) => {
      if (divRef.current) {
        // Security: Use DOMParser instead of innerHTML to prevent XSS
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");
        const svgElement = doc.documentElement;
        
        // Clear previous content and append the parsed SVG element
        divRef.current.innerHTML = "";
        divRef.current.appendChild(svgElement);
      }
    }).catch((err) => {
      console.error("Error generating QR code: " + err);
    });
  }, [props.data]);

  return (
    <div ref={divRef}></div>
  );
}

export default QRCodeComponent;