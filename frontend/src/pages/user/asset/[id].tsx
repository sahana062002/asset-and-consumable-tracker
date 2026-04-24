import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '../../../api/assets';
import { locationsApi } from '../../../api/locations';
import { useToast } from '../../../hooks/useToast';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import UserAssetDetailsPageUI from './AssetDetailsPage';

export default function UserAssetDetailsPageContainer() {
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
    retry: 0,
    enabled: !!assetCode
  });

  const { data: locationsRes } = useQuery({ 
    queryKey: ['locations-flat'], 
    queryFn: () => locationsApi.getFlat()
  });

  const asset = assetRes?.data;
  
  useEffect(() => {
    if (asset) {
      try {
        const stored = localStorage.getItem('scan_history');
        let history = stored ? JSON.parse(stored) : [];
        history = history.filter((h: any) => h.code !== asset.assetCode);
        history.unshift({ code: asset.assetCode, name: asset.name, type: asset.type, timestamp: Date.now() });
        history = history.slice(0, 10);
        localStorage.setItem('scan_history', JSON.stringify(history));
      } catch(e) {}
      
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

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (String(locationId) === String(asset?.locationId)) {
      error("Identical Coordinates", "The unit is already present at the requested coordinates.");
      return;
    }
    updateLocationMutation.mutate({ location_id: Number(locationId), notes: locationNotes });
  };

  const handleUsageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(usageQty);
    if (!q || q <= 0 || q > asset?.quantity) {
      error("Invalid Volumetric Offset", "Usage offset boundary limits exceeded.");
      return;
    }
    updateUsageMutation.mutate({ quantity_used: q, notes: usageNotes });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <UserAssetDetailsPageUI 
      asset={asset}
      locations={locationsRes?.data || []}
      isLoading={isLoading}
      isError={isError}
      assetCode={assetCode!}
      basePath={basePath}
      disposalTriggered={disposalTriggered}
      usageQty={usageQty}
      setUsageQty={setUsageQty}
      usageNotes={usageNotes}
      setUsageNotes={setUsageNotes}
      locationId={locationId}
      setLocationId={setLocationId}
      locationNotes={locationNotes}
      setLocationNotes={setLocationNotes}
      onNavigate={navigate}
      handleLocationSubmit={handleLocationSubmit}
      handleUsageSubmit={handleUsageSubmit}
      updateLocationPending={updateLocationMutation.isPending}
      updateUsagePending={updateUsageMutation.isPending}
    />
  );
}
