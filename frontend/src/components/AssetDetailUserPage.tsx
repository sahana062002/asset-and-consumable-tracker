import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi, locationsApi } from '../lib/api';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { StatusBadge } from './ui/StatusBadge';
import { DisposalFlow } from './DisposalFlow';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { MapPin, ArrowLeft, AlertTriangle, Box, DatabaseZap } from 'lucide-react';

export default function AssetDetailUserPage() {
  const { assetCode } = useParams<{ assetCode: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const basePath = pathname.includes('/dashboard') ? '/dashboard/scan' : '/scan';
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [disposalTriggered, setDisposalTriggered] = useState(false);
  const [usageQty, setUsageQty] = useState<number | string>('');
  const [usageNotes, setUsageNotes] = useState('');
  
  const [locationId, setLocationId] = useState<string>('');
  const [locationNotes, setLocationNotes] = useState('');

  const { data: assetRes, isLoading, isError } = useQuery({ 
    queryKey: ['scan-asset', assetCode], 
    queryFn: () => assetsApi.scan(assetCode!),
    retry: 0
  });

  const { data: locationsRes } = useQuery({ 
    queryKey: ['locations-flat'], 
    queryFn: () => locationsApi.getFlat()
  });

  const asset = assetRes?.data;
  
  useEffect(() => {
    // Append to local history perfectly
    if (asset) {
      try {
        const stored = localStorage.getItem('scan_history');
        let history = stored ? JSON.parse(stored) : [];
        history = history.filter((h: any) => h.code !== asset.assetCode);
        history.unshift({ code: asset.assetCode, name: asset.name, type: asset.type, timestamp: Date.now() });
        history = history.slice(0, 10);
        localStorage.setItem('scan_history', JSON.stringify(history));
      } catch(e) {}
      
      // Seed location
      if (!locationId) setLocationId(String(asset.locationId));
    }
  }, [asset]);

  const updateLocationMutation = useMutation({
    mutationFn: (payload: any) => assetsApi.updateLocation(asset.id, payload),
    onSuccess: () => {
      success("Coordinate Lock Updated", "Central maps successfully adjusted.");
      queryClient.invalidateQueries({ queryKey: ['scan-asset', assetCode] });
      setLocationNotes('');
    },
    onError: (err: any) => error('Coordinate Swap Failed', err.response?.data?.message)
  });

  const updateUsageMutation = useMutation({
    mutationFn: (payload: any) => assetsApi.updateUsage(asset.id, payload),
    onSuccess: (res) => {
      if (res.data?.requiresDisposalPhoto) {
        setDisposalTriggered(true);
      } else {
        success("Telemetry Updated", "Payload volumetric data successfully logged.");
        queryClient.invalidateQueries({ queryKey: ['scan-asset', assetCode] });
        setUsageQty('');
        setUsageNotes('');
      }
    },
    onError: (err: any) => error('Telemetry Update Failed', err.response?.data?.message)
  });

  if (isLoading) return <LoadingSpinner />;
  
  if (isError || !asset) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl shadow-xl border mt-8">
        <AlertTriangle size={48} className="text-destructive mb-4 opacity-80" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Target Undetected</h2>
        <p className="text-muted-foreground mt-2 mb-6">Database scan returned negative for identifier {assetCode}</p>
        <Button size="lg" className="shadow-lg hover:scale-105 transition-transform" onClick={() => navigate(basePath)}>
          <ArrowLeft className="mr-2" /> Re-engage Scanner
        </Button>
      </div>
    );
  }

  if (disposalTriggered) {
    return <DisposalFlow assetId={asset.id} assetName={asset.name} onSuccess={() => navigate(basePath)} onCancel={() => navigate(basePath)} />
  }

  const isConsumable = asset.type === 'consumable';
  const isDisposed = asset.status === 'disposed';

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (String(locationId) === String(asset.locationId)) {
      error("Identical Coordinates", "The unit is already present at the requested coordinates.");
      return;
    }
    updateLocationMutation.mutate({ location_id: Number(locationId), notes: locationNotes });
  };

  const handleUsageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(usageQty);
    if (!q || q <= 0 || q > asset.quantity) {
      error("Invalid Volumetric Offset", "Usage offset boundary limits exceeded.");
      return;
    }
    updateUsageMutation.mutate({ quantity_used: q, notes: usageNotes });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      
      <div className="flex items-center space-x-3 mb-2">
        <Button variant="outline" size="icon" className="rounded-full shadow-sm" onClick={() => navigate(basePath)}>
           <ArrowLeft size={18} />
        </Button>
        <h2 className="font-bold text-lg">Sensor Log</h2>
      </div>

      {isDisposed && (
        <div className="bg-destructive text-destructive-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <AlertTriangle className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
          <h3 className="text-xl font-black mb-2 uppercase tracking-wide">Decommissioned Node</h3>
          <p className="font-medium text-destructive-foreground/90">
            This module was completely consumed and destroyed on {new Date(asset.disposedAt).toLocaleDateString()}. Modification vectors locked.
          </p>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="bg-muted/30 p-6 border-b flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
             {isConsumable ? <DatabaseZap size={32} className="text-primary" /> : <Box size={32} className="text-primary"/>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight leading-none mb-2">{asset.name}</h1>
          <p className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground border mb-4">{asset.assetCode}</p>
          <div className="flex space-x-2">
             <StatusBadge type={asset.type} />
             <StatusBadge status={asset.status} />
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start mb-4">
             <MapPin size={18} className="text-primary mr-3 shrink-0 mt-0.5" />
             <div>
               <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-1">Live Coordinate Origin</p>
               <p className="text-sm font-semibold">{asset.locationPath}</p>
             </div>
          </div>
          
          {isConsumable && (
            <div className="mt-6 pt-6 border-t border-dashed">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-sm uppercase font-bold text-muted-foreground tracking-wider">Payload State</span>
                 <span className="text-sm font-black">{asset.quantity} <span className="text-xs text-muted-foreground font-medium">of {asset.initialQuantity}</span></span>
               </div>
               <div className="h-4 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                 <div 
                  className={`h-full rounded-full transition-all duration-500 ${(asset.quantity/asset.initialQuantity) < 0.25 ? 'bg-destructive' : 'bg-primary'}`} 
                  style={{ width: `${Math.max(0, (asset.quantity/asset.initialQuantity)*100)}%` }}
                 />
               </div>
            </div>
          )}
        </div>
      </div>

      {!isDisposed && asset.type === 'fixed' && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mt-4">
          <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
            <MapPin size={18} className="mr-2 text-primary" /> Translocate Node
          </h3>
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Target Destination Map</Label>
              <select 
                 className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary shadow-sm overflow-hidden"
                 value={locationId}
                 onChange={(e) => setLocationId(e.target.value)}
              >
                {locationsRes?.data?.map((loc: any) => (
                  <option key={loc.id} value={loc.id} title={loc.path}>{loc.path}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Translocation Reasoning / Notes</Label>
              <Textarea 
                placeholder="Log physical constraints or routing logic..." 
                value={locationNotes}
                onChange={(e) => setLocationNotes(e.target.value)}
                className="resize-none shadow-sm h-20"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-md font-bold shadow hover:scale-[1.02] transition-transform" disabled={updateLocationMutation.isPending}>
              {updateLocationMutation.isPending ? 'Syncing...' : 'Lock New Coordinates'}
            </Button>
          </form>
        </div>
      )}

      {!isDisposed && asset.type === 'consumable' && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mt-4 border-t-4 border-t-primary">
          <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
            <DatabaseZap size={18} className="mr-2 text-primary" /> Drain Sequence
          </h3>
          <form onSubmit={handleUsageSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Subtract Volume Extracted</Label>
              <Input 
                type="number" 
                min="1" 
                max={asset.quantity}
                value={usageQty}
                onChange={(e) => setUsageQty(e.target.value)}
                className="h-12 text-lg font-bold shadow-sm"
                placeholder="0"
                required
              />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground font-semibold">Min: 1</span>
                <span className="text-primary font-bold">Max Limit: {asset.quantity}</span>
              </div>
            </div>
            {Number(usageQty) > 0 && Number(usageQty) <= asset.quantity && (
              <div className="p-3 bg-muted/40 rounded-lg text-sm text-center border font-medium text-muted-foreground animate-in fade-in">
                State Projection: <span className="font-mono bg-muted px-2 py-0.5 rounded shadow-sm text-foreground ml-1">{asset.quantity - Number(usageQty)} volume remaining</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Engineering Notes / Logs</Label>
              <Textarea 
                placeholder="Record objective..." 
                value={usageNotes}
                onChange={(e) => setUsageNotes(e.target.value)}
                className="resize-none shadow-sm h-20"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-md font-bold shadow hover:scale-[1.02] transition-transform bg-primary" disabled={updateUsageMutation.isPending}>
              {updateUsageMutation.isPending ? 'Locking Drain...' : 'Confirm Payload Burn'}
            </Button>
          </form>
        </div>
      )}

      {isDisposed && (
         <Button className="w-full h-14 text-md font-bold shadow-xl rounded-xl" onClick={() => navigate(basePath)}>
           <ArrowLeft size={18} className="mr-2" /> Resume Scanning Map
         </Button>
      )}

    </div>
  );
}
