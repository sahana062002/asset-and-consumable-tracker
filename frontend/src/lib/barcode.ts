import JsBarcode from 'jsbarcode';

export const barcodeUtils = {
  renderToNode(node: SVGSVGElement | HTMLCanvasElement, code: string) {
    if (!node) return;
    try {
      JsBarcode(node, code, {
        format: "CODE128",
        displayValue: true,
        lineColor: "#0f172a", // slate-900 to match theme
        background: "transparent",
        height: 60,
        width: 2,
        fontSize: 14,
        font: "monospace"
      });
    } catch (e) {
      console.error("Barcode render error", e);
    }
  },
  
  downloadAsPNG(code: string, filename: string) {
    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, code, { 
        format: "CODE128", 
        displayValue: true, 
        background: "#ffffff", // solid white for downloads safely
        lineColor: "#000000",
        height: 70, 
        width: 2.5,
        margin: 15
      });
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Barcode generic generator download fail", e);
    }
  },
  
  print(code: string) {
    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, code, { 
        format: "CODE128", 
        displayValue: true, 
        background: "#ffffff", 
        lineColor: "#000000",
        height: 80, 
        width: 3,
        fontSize: 16,
        margin: 20
      });
      const url = canvas.toDataURL("image/png");
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Asset Barcode - ${code}</title>
            <style>
               body { 
                 margin: 0; 
                 display: flex; 
                 align-items: center; 
                 justify-content: center; 
                 height: 100vh; 
                 background: white; 
               }
               img { max-width: 100%; object-fit: contain; }
               @media print {
                 @page { size: auto; margin: 0mm; }
                 body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
               }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <img src="${url}" alt="${code}" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch(e) {
      console.error("Barcode print fail", e);
    }
  }
};
