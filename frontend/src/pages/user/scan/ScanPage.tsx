import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanLine, KeySquare, XCircle, Search, History, AlertTriangle } from 'lucide-react';

interface ScanPageUIProps {
  manualCode: string;
  setManualCode: (val: string) => void;
  history: any[];
  handleManualLookup: (e: React.FormEvent) => void;
  handleClearHistory: () => void;
  isScanning: boolean;
  startScan: () => void;
  stopScan: () => void;
  error: string | null;
  onHistoryItemClick: (code: string) => void;
}

export default function ScanPageUI({
  manualCode,
  setManualCode,
  history,
  handleManualLookup,
  handleClearHistory,
  isScanning,
  startScan,
  stopScan,
  error,
  onHistoryItemClick
}: ScanPageUIProps) {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-300">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Scan Asset Barcode</h1>
        <p className="text-muted-foreground text-sm">Center the barcode or QR inside the capture frame.</p>
      </div>

      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border flex flex-col items-center p-6 relative">
        
        {/* Viewfinder Target Area */}
        <div className="w-full max-w-[300px] aspect-square relative mb-6">
           {/* Corner Brackets */}
           <div className={`absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 rounded-tl-lg transition-colors ${isScanning ? 'border-primary animate-pulse' : 'border-muted-foreground'}`}></div>
           <div className={`absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 rounded-tr-lg transition-colors ${isScanning ? 'border-primary animate-pulse' : 'border-muted-foreground'}`}></div>
           <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 rounded-bl-lg transition-colors ${isScanning ? 'border-primary animate-pulse' : 'border-muted-foreground'}`}></div>
           <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 rounded-br-lg transition-colors ${isScanning ? 'border-primary animate-pulse' : 'border-muted-foreground'}`}></div>
           
           {/* Camera HTML Target (Must be strictly empty for DOM injection) */}
           <div id="reader" className="w-full h-full bg-black/10 rounded overflow-hidden absolute inset-0 z-0"></div>
           
           <div className="w-full h-full relative z-10 pointer-events-none flex flex-col items-center justify-center">
             {!isScanning && !error && (
               <div className="text-muted-foreground flex flex-col items-center">
                 <ScanLine size={48} className="mb-2 opacity-50" />
                 <span className="text-sm font-semibold tracking-wider uppercase">Sensor Standby</span>
               </div>
             )}
             {error && (
               <div className="text-destructive p-4 text-center bg-background/90 rounded-lg shadow pointer-events-auto max-w-[80%] border border-destructive/20">
                 <AlertTriangle size={36} className="mb-2 mx-auto" />
                 <span className="text-sm font-bold uppercase tracking-wider block">Sensor Array Error</span>
                 <span className="text-xs mt-1 block">{error}</span>
               </div>
             )}
           </div>
        </div>

        <div className="w-full space-y-4">
          {!isScanning ? (
            <Button onClick={() => startScan()} className="w-full h-12 text-md font-bold shadow-md hover:scale-[1.02] transition-transform">
               <ScanLine className="mr-2" /> Ignite Optics
            </Button>
          ) : (
            <Button onClick={() => stopScan()} variant="destructive" className="w-full h-12 text-md font-bold shadow-md hover:scale-[1.02] transition-transform">
               <XCircle className="mr-2" /> Sever Feed
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mt-4">
        <form onSubmit={handleManualLookup} className="space-y-4">
          <Label className="uppercase text-xs font-bold text-muted-foreground tracking-widest flex items-center">
            <KeySquare size={14} className="mr-1.5" /> Manual Override
          </Label>
          <div className="flex space-x-2">
            <Input 
              placeholder="AST-XXXXXXXX" 
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="font-mono uppercase h-12 text-lg"
            />
            <Button type="submit" className="h-12 px-6 shadow-sm"><Search size={18} /></Button>
          </div>
        </form>
      </div>

      {history.length > 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
           <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
             <h3 className="font-bold flex items-center">
               <History size={16} className="mr-2 text-primary" /> Logged Artifacts
             </h3>
             <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-xs h-7 px-2 text-muted-foreground hover:text-destructive">
               Clear Log
             </Button>
           </div>
           <div className="divide-y divide-border">
             {history.map((h, i) => (
               <div key={i} onClick={() => onHistoryItemClick(h.code)} className="px-6 py-4 flex items-center justify-between hover:bg-muted/40 cursor-pointer transition-colors group">
                 <div>
                   <p className="font-semibold text-sm group-hover:text-primary transition-colors">{h.name}</p>
                   <p className="font-mono text-xs text-muted-foreground">{h.code}</p>
                 </div>
                 <div className="text-right flex flex-col items-end">
                   <StatusBadge type={h.type as any} />
                   <p className="text-[10px] text-muted-foreground mt-1">{new Date(h.timestamp).toLocaleTimeString()}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

    </div>
  );
}
