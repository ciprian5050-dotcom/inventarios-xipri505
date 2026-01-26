import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';
import { Download, Printer, X } from 'lucide-react';
import { Card } from './ui/card';

interface ActivoQRCodeProps {
  activoId: string;
  activoNombre: string;
  activoQr: string;
  onClose: () => void;
}

export function ActivoQRCode({ activoId, activoNombre, activoQr, onClose }: ActivoQRCodeProps) {
  // Generar URL pública para el QR
  const qrUrl = `${window.location.origin}/#/public/activo/${activoId}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 800;
      canvas.height = 900;

      // Fondo blanco
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Activo Fijo', canvas.width / 2, 50);

        // Código QR
        ctx.font = '24px Arial';
        ctx.fillText(`Código: ${activoQr}`, canvas.width / 2, 90);

        // QR code
        ctx.drawImage(img, 150, 120, 500, 500);

        // Nombre del activo
        ctx.font = '20px Arial';
        ctx.fillStyle = '#475569';
        ctx.fillText(activoNombre, canvas.width / 2, 660);

        // Instrucciones
        ctx.font = '16px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Escanea este código para ver la información del activo', canvas.width / 2, 720);
      }

      // Descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `QR-${activoQr}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) return;

    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código QR - ${activoQr}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 40px;
              margin: 0;
            }
            .title {
              font-size: 32px;
              font-weight: bold;
              color: #334155;
              margin-bottom: 10px;
            }
            .code {
              font-size: 24px;
              color: #475569;
              margin-bottom: 30px;
            }
            .qr-container {
              margin-bottom: 20px;
            }
            .name {
              font-size: 20px;
              color: #475569;
              margin-bottom: 10px;
            }
            .instructions {
              font-size: 16px;
              color: #64748b;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="title">Activo Fijo</div>
          <div class="code">Código: ${activoQr}</div>
          <div class="qr-container">
            ${svgData}
          </div>
          <div class="name">${activoNombre}</div>
          <div class="instructions">Escanea este código para ver la información del activo</div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Contenido */}
        <div className="text-center">
          <h2 className="text-slate-900 mb-2">Código QR del Activo</h2>
          <p className="text-slate-600 mb-6">Código: {activoQr}</p>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 mb-4 inline-block">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrUrl}
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>

          <p className="text-slate-700 mb-2">{activoNombre}</p>
          <p className="text-slate-600 mb-6">
            Escanea este código para ver la información del activo
          </p>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Descargar
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>

          {/* URL para compartir */}
          <div className="mt-6 p-3 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-2">URL del activo:</p>
            <p className="text-slate-700 break-all">{qrUrl}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
