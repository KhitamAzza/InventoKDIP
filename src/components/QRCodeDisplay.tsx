import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  seriesNumber: string;
  equipmentName?: string;
  labLocation?: string;
  size?: number;
  showActions?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  seriesNumber,
  equipmentName,
  labLocation,
  size = 180,
  showActions = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!seriesNumber) return;

    QRCode.toDataURL(seriesNumber, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Failed generating QR code', err));
  }, [seriesNumber, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(seriesNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${seriesNumber}.png`;
    a.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Equipment Tag - ${seriesNumber}</title>
          <style>
            @page { size: 3.5in 2in; margin: 0.1in; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #fff;
            }
            .tag {
              border: 2px dashed #334155;
              padding: 12px 16px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 16px;
              max-width: 380px;
            }
            .qr { width: 110px; height: 110px; }
            .info { font-size: 11px; color: #1e293b; }
            .info h2 { font-size: 13px; margin: 0 0 4px 0; font-weight: 700; color: #0f172a; }
            .badge {
              display: inline-block;
              font-family: ui-monospace, SFMono-Regular, monospace;
              font-size: 11px;
              font-weight: 700;
              background: #f1f5f9;
              padding: 3px 6px;
              border-radius: 4px;
              letter-spacing: 0.5px;
              margin: 4px 0;
            }
            .sub { color: #64748b; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="tag">
            <img class="qr" src="${dataUrl}" alt="QR" />
            <div class="info">
              <div class="sub">LAB EQUIPMENT TAG</div>
              <h2>${equipmentName || 'Equipment Asset'}</h2>
              <div class="badge">${seriesNumber}</div>
              <div class="sub">${labLocation || 'Computer Lab'}</div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id="qr-code-card" className="flex flex-col items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
      <div className="bg-white p-2 rounded-lg border border-slate-100 flex items-center justify-center">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR code for ${seriesNumber}`}
            style={{ width: size, height: size }}
            className="rounded-md"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center text-xs text-slate-400 animate-pulse bg-slate-50 rounded-md"
          >
            Generating QR...
          </div>
        )}
      </div>

      <div className="mt-3 text-center w-full">
        <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 select-all block break-all">
          {seriesNumber}
        </span>
        {equipmentName && (
          <p className="text-xs font-medium text-slate-600 mt-1 truncate max-w-[220px]">
            {equipmentName}
          </p>
        )}
      </div>

      {showActions && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 w-full justify-center">
          <button
            id="qr-copy-btn"
            type="button"
            onClick={handleCopy}
            title="Copy Series Number"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="qr-download-btn"
            type="button"
            onClick={handleDownload}
            title="Download QR Image"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            id="qr-print-btn"
            type="button"
            onClick={handlePrint}
            title="Print Asset Label"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      )}
    </div>
  );
};
