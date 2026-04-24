import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { assetsApi, locationsApi } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageSearch, Download, Plus, Eye, Trash2, Printer } from 'lucide-react';
import { barcodeUtils } from '../../lib/barcode';

const assetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['fixed', 'consumable']),
  location_id: z.string().min(1, 'Location required'),
  quantity: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.type === 'consumable' && (!data.quantity || Number(data.quantity) <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Positive quantity is required for consumables',
      path: ['quantity']
    });
  }
});

function SuccessDialog({ asset, onClose, onReset }: any) {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (asset && svgRef.current) {
      barcodeUtils.renderToNode(svgRef.current, asset.assetCode);
    }
  }, [asset]);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
       <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden zoom-in-95 animate-in">
         <div className="p-8 text-center border-b bg-muted/10">
           <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
             <PackageSearch className="text-emerald-600 w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold tracking-tight text-foreground">Asset Initialized!</h2>
           <p className="text-muted-foreground mt-2">Physical code generated and safely loaded.</p>
         </div>
         
         <div className="p-8 flex flex-col items-center border-b">
           <svg ref={svgRef} className="w-full h-auto max-w-[280px]" />
           <p className="font-semibold text-lg mt-4">{asset.name}</p>
           <p className="text-muted-foreground font-mono bg-muted px-2 py-1 rounded text-sm mt-1">{asset.assetCode}</p>
         </div>

         <div className="p-4 bg-muted/30 grid gap-2 sm:grid-cols-2">
           <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => barcodeUtils.print(asset.assetCode)}>
             <Printer size={16} className="mr-2" /> Print Map
           </Button>
           <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => barcodeUtils.downloadAsPNG(asset.assetCode, `barcode-${asset.assetCode}`)}>
             <Download size={16} className="mr-2" /> Download
           </Button>
           <Button variant="secondary" className="w-full mt-2 sm:col-span-1" onClick={onReset}>
             Create Another
           </Button>
           <Button className="w-full mt-2 sm:col-span-1 border border-border" onClick={() => navigate(`/dashboard/assets/${asset.id}`)}>
             <Eye size={16} className="mr-2" /> Open Detail
           </Button>
           <div className="sm:col-span-2 pt-2">
             <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={onClose}>
                Close Interface
             </Button>
           </div>
         </div>
       </div>
    </div>
  );
}

export default function AssetsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successAsset, setSuccessAsset] = useState<any>(null);

  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({ 
    queryKey: ['assets', { search, type: typeFilter, status: statusFilter }], 
    queryFn: () => {
      const params: any = {};
      if (search) params.search = search;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      return assetsApi.list(params);
    }
  });

  const { data: flatLocations, isLoading: locLoading } = useQuery({ queryKey: ['locations-flat'], queryFn: () => locationsApi.getFlat() });

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: { name: '', type: 'fixed', location_id: '', quantity: '' }
  });

  const selectedType = watch('type');

  const createMutation = useMutation({
    mutationFn: (payload: any) => assetsApi.create({ ...payload, location_id: Number(payload.location_id), quantity: payload.quantity ? Number(payload.quantity) : undefined }),
    onSuccess: (res) => {
      success('Asset generated dynamically', 'Physical tags actively synchronized.');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setSuccessAsset(res.data);
    },
    onError: (err: any) => error('Failed Initialization', err.response?.data?.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => assetsApi.delete(id),
    onSuccess: () => {
      success('Asset safely demolished.', 'All data references severed.');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (err: any) => error('Failed Configuration', err.response?.data?.message)
  });

  const openCreate = () => {
    reset({ name: '', type: 'fixed', location_id: '', quantity: '' });
    setSuccessAsset(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const columns = [
    { 
      header: 'Tracking Barcode', 
      accessor: (row: any) => <span className="font-mono text-xs px-2 py-1 bg-muted rounded border border-border/50 shadow-sm">{row.assetCode}</span> 
    },
    { 
      header: 'Identity', 
      accessor: 'name' as keyof any 
    },
    { 
      header: 'Type', 
      accessor: (row: any) => <StatusBadge type={row.type} /> 
    },
    {
      header: 'Status',
      accessor: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: 'Node Coordinate',
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground block truncate max-w-[200px]" title={row.locationPath}>
          {row.locationPath}
        </span>
      )
    },
    {
      header: 'Payload',
      accessor: (row: any) => {
        if (row.type !== 'consumable') return <span className="text-muted-foreground italic">—</span>;
        const pct = row.initialQuantity ? Math.max(0, Math.min(100, (row.quantity / row.initialQuantity) * 100)) : 0;
        return (
          <div className="w-full flex items-center space-x-2">
            <span className="text-xs font-semibold whitespace-nowrap">{row.quantity} / {row.initialQuantity}</span>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shrink-0 min-w-[50px]">
               <div className={`h-full rounded-full transition-all ${pct < 20 ? 'bg-destructive' : pct < 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center space-x-1">
          <Link to={`/dashboard/assets/${row.id}`} className="p-2 bg-transparent hover:bg-muted/50 rounded-md transition-colors text-primary border border-transparent hover:border-border">
            <Eye size={16} />
          </Link>
          {row.status === 'active' && (
             <ConfirmDialog 
               title="Dismantle Asset Entry?"
               description={`Are you declaring ${row.assetCode} fully offline? Data will securely detach.`}
               onConfirm={() => deleteMutation.mutate(row.id)}
               variant="destructive"
               trigger={
                 <button className="p-2 cursor-pointer bg-transparent hover:bg-destructive/10 rounded-md transition-colors text-destructive border border-transparent hover:border-destructive/20 ml-1">
                   <Trash2 size={16} />
                 </button>
               }
             />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Physical Node Arsenal" 
        subtitle="Manage globally deployed infrastructure equipment dynamically using secure barcodes."
        action={
           <Button onClick={openCreate} className="shadow-lg h-10 hover:scale-105 transition-transform duration-200">
             <Plus size={18} className="mr-2" /> Generate Asset
           </Button>
        }
      />

      <div className="bg-card rounded-lg border border-border p-4 mb-6 shadow-sm overflow-hidden mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Scan Target</Label>
             <Input 
               placeholder="Search identifiers..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)}
               className="h-9 focus-visible:ring-primary shadow-inner"
             />
           </div>
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Deployment Module</Label>
             <select 
               className="w-full h-9 rounded-md border border-input px-3 hover:bg-muted/40 transition-colors"
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
             >
               <option value="all">Universal View Focus</option>
               <option value="fixed">Fixed Installations</option>
               <option value="consumable">Liquid / Consumables</option>
             </select>
           </div>
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Signal Integrity</Label>
             <select 
               className="w-full h-9 rounded-md border border-input px-3 hover:bg-muted/40 transition-colors"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="all">Broad Spectrum</option>
               <option value="active">Active Operations (Live)</option>
               <option value="disposed">Disposed Nodes (Dead)</option>
             </select>
           </div>
        </div>
      </div>

      <DataTable data={data?.data || []} columns={columns} isLoading={isLoading} />

      {dialogOpen && !successAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={closeDialog}>
           <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border overflow-hidden zoom-in-95 animate-in" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b bg-muted/10">
               <h2 className="text-2xl font-bold tracking-tight">Construct Entry</h2>
               <p className="text-sm text-muted-foreground mt-1">Bind a new physical component strictly to a local map.</p>
             </div>
             
             <div className="p-6">
               <form id="asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                 
                 <div className="space-y-2">
                   <Label>Reference Name</Label>
                   <Input {...register('name')} placeholder="e.g. Dell Monitor P2419H" className={errors.name ? 'border-destructive' : ''} />
                   {errors.name && <p className="text-xs font-semibold text-destructive">{errors.name.message as string}</p>}
                 </div>

                 <div className="space-y-2">
                   <Label>Modality</Label>
                   <div className="flex space-x-4 pt-1">
                     <label className="flex items-center space-x-2 cursor-pointer font-medium text-sm border px-3 py-2 rounded-md hover:bg-muted/30 transition-colors">
                       <input type="radio" value="fixed" {...register('type')} className="text-primary w-4 h-4" />
                       <span>Fixed Structure</span>
                     </label>
                     <label className="flex items-center space-x-2 cursor-pointer font-medium text-sm border px-3 py-2 rounded-md hover:bg-muted/30 transition-colors">
                       <input type="radio" value="consumable" {...register('type')} className="text-primary w-4 h-4" />
                       <span>Liquid / Pack</span>
                     </label>
                   </div>
                 </div>

                 {selectedType === 'consumable' && (
                   <div className="space-y-2 animate-in slide-in-from-top-2">
                     <Label>Base Volume / Initial Quantity</Label>
                     <Input type="number" {...register('quantity')} placeholder="0" className={errors.quantity ? 'border-destructive' : ''} />
                     {errors.quantity && <p className="text-xs font-semibold text-destructive">{errors.quantity.message as string}</p>}
                   </div>
                 )}

                 <div className="space-y-2">
                   <Label>Host Location Array</Label>
                   <select 
                     {...register('location_id')} 
                     className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 block truncate cursor-pointer"
                   >
                     <option value="">-- Interface Coordinates --</option>
                     {flatLocations?.data?.map((loc: any) => (
                       <option key={loc.id} value={loc.id} className="truncate">{loc.path}</option>
                     ))}
                   </select>
                   {errors.location_id && <p className="text-xs font-semibold text-destructive">{errors.location_id.message as string}</p>}
                 </div>

               </form>
             </div>

             <div className="p-6 bg-muted/40 border-t flex justify-end space-x-3 rounded-b-2xl">
               <Button variant="ghost" onClick={closeDialog} type="button">Abort</Button>
               <Button form="asset-form" type="submit" disabled={isSubmitting || createMutation.isPending} className="shadow">
                 {isSubmitting ? 'Syncing Map...' : 'Fabricate Mapping'}
               </Button>
             </div>
           </div>
        </div>
      )}

      {successAsset && (
        <SuccessDialog asset={successAsset} onClose={closeDialog} onReset={openCreate} />
      )}
    </>
  );
}
