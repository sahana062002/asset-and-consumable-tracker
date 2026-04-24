import { useState, useRef } from 'react';
import { Camera, CheckCircle2, UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assetsApi } from '../lib/api';

interface DisposalFlowProps {
  assetId: number;
  assetName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DisposalFlow({ assetId, assetName, onSuccess, onCancel }: DisposalFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStep(2);
    }
  };

  const submitDisposal = async () => {
    if (!file) return;
    setStep(3);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      await assetsApi.dispose(assetId, formData);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload visual evidence');
      setStep(2);
    }
  };

  if (step === 1) {
    return (
      <div className="bg-card rounded-2xl shadow-xl border border-destructive overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-8 text-center bg-destructive/10 border-b border-destructive/20 relative">
          <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Camera className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-destructive">Component Exhausted</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-[260px] mx-auto mt-2">
            This module has reached zero volume. Photographic evidence of the terminal state must be secured before logging final closure.
          </p>
        </div>
        <div className="p-6 text-center">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleCapture} 
          />
          <Button size="lg" className="w-full text-md h-14 font-bold shadow-lg" onClick={() => fileInputRef.current?.click()}>
             <Camera className="mr-2" /> Capture Evidence Log
          </Button>
          <Button variant="ghost" className="w-full mt-3" onClick={onCancel}>Bypass Sequence</Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Verify Telemetry</h2>
          <button onClick={() => fileInputRef.current?.click()} className="text-primary text-sm font-semibold hover:underline">
            Recalibrate
          </button>
        </div>
        <div className="p-4 flex flex-col items-center bg-black/5">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleCapture} 
          />
          {preview && <img src={preview} alt="Evidence" className="w-full max-h-[300px] object-contain rounded border shadow-sm bg-black" />}
        </div>
        
        {error && <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm font-semibold text-center">{error}</div>}

        <div className="p-6 grid gap-3 sm:grid-cols-2 bg-muted/40 border-t">
          <Button variant="outline" onClick={onCancel}>Cancel Flow</Button>
          <Button onClick={submitDisposal} className="shadow-md font-bold">
            <UploadCloud className="mr-2" size={18} /> Transmit Payload
          </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden p-12 flex flex-col items-center justify-center animate-in fade-in">
        <Loader2 size={48} className="animate-spin text-primary mb-4" />
        <h2 className="text-xl font-bold">Encrypting Payload...</h2>
        <p className="text-muted-foreground text-sm mt-2 text-center">Awaiting central server confirmation block.</p>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 rounded-2xl shadow-xl border border-emerald-200 overflow-hidden text-center p-8 animate-in zoom-in-95 dark:bg-emerald-950/20 dark:border-emerald-900">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner dark:bg-emerald-900">
         <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">Terminal State Verified</h2>
      <p className="text-emerald-600 dark:text-emerald-400/80 font-medium mt-2 mb-6">
        {assetName} has been fully decommissioned successfully.
      </p>
      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg h-12 text-md font-bold" onClick={onSuccess}>
        Scan Next Artifact
      </Button>
    </div>
  );
}
