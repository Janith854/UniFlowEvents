import React from 'react';

export function QRCode({ value }) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
        QR for:
        <br />
        {value || 'event / ticket'}
      </div>
      <span className="text-xs text-gray-500">
        Scan at the entrance for quick check-in.
      </span>
    </div>
  );
}

