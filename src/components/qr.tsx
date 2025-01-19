"use client";
import React from 'react';
import { useQRCode } from 'next-qrcode';

function QR({url}: {url:string}) {
  const { Canvas } = useQRCode();

  return (
    <Canvas
      text={url}
      options={{
        errorCorrectionLevel: 'M',
        margin: 3,
        scale: 4,
        width: 200,
        color: {
          dark: '#434dba',
          light: '#FFFFFFFF',
        },
      }}
    />
  );
}

export default QR;