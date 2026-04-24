import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from "html5-qrcode";
import { useEffect, useRef, useState, useCallback } from "react";

export function useQRScanner(
  elementId: string, 
  onScanSuccess: (decodedText: string) => void,
  onScanError?: (error: any) => void
) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Auto select back camera if available, otherwise first
          const backCam = devices.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
          setActiveCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        setError("Camera permissions denied or device missing.");
        console.error(err);
      });
  }, []);

  const startScan = useCallback(async () => {
    try {
      setError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.8);
            return { width: size, height: size };
          }
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (err) => {
          if (onScanError && !err?.includes("NotFound")) onScanError(err);
        }
      );
      
      setIsScanning(true);
    } catch (err: any) {
      setError(err?.message || "Camera permissions denied or optical array missing.");
      setIsScanning(false);
    }
  }, [elementId, onScanSuccess, onScanError]);

  const stopScan = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error("Sensor stop error:", e);
      }
      setIsScanning(false);
    }
  }, [isScanning]);

  useEffect(() => {
    return () => {
      // Auto cleanup on component dismount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return { isScanning, startScan, stopScan, error, cameras, activeCameraId };
}
