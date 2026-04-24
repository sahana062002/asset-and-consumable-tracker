import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQRScanner } from '../../../lib/scanner';
import ScanPageUI from './ScanPage';

interface ScanHistory {
  code: string;
  name: string;
  type: string;
  timestamp: number;
}

export default function ScanPageContainer() {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [history, setHistory] = useState<ScanHistory[]>([]);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('scan_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    stopScan();
    navigate(`asset/${decodedText}`);
  };

  const { isScanning, startScan, stopScan, error } = useQRScanner("reader", handleScanSuccess);

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    navigate(`asset/${manualCode.trim().toUpperCase()}`);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('scan_history');
    setHistory([]);
  };

  const onHistoryItemClick = (code: string) => {
    navigate(`asset/${code}`);
  };

  return (
    <ScanPageUI 
      manualCode={manualCode}
      setManualCode={setManualCode}
      history={history}
      handleManualLookup={handleManualLookup}
      handleClearHistory={handleClearHistory}
      isScanning={isScanning}
      startScan={startScan}
      stopScan={stopScan}
      error={error}
      onHistoryItemClick={onHistoryItemClick}
    />
  );
}
