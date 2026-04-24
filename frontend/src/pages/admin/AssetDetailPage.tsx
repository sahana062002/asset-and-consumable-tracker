import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '../../lib/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download, MapPin, Package, User, Clock, HardDrive, FileText, Activity, AlertTriangle, Trash2 } from 'lucide-react';
import { barcodeUtils } from '../../lib/barcode';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: result, isLoading, isError } = useQuery({ 
    queryKey: ['asset', id], 
    queryFn: () => assetsApi.getOne(Number(id)),
    retry: 1
  });

  const asset = result?.data;

  useEffect(() => {
    if (asset && svgRef.current) {
      barcodeUtils.renderToNode(svgRef.current, asset.assetCode);
    }
  }, [asset]);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !asset) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold mb-2">Asset Not Found</h2>
        <Button onClick={() => navigate('/dashboard/assets')}>Return to List</Button>
      </div>
    );
  }

  const isConsumable = asset.type === 'consumable';
  const pct = isConsumable && asset.initialQuantity ? Math.max(0, Math.min(100, (asset.quantity / asset.initialQuantity) * 100)) : 0;

  return (
    <>
      <div className="mb-6 flex items-center">
         <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/assets')} className="mr-4 hover:bg-muted text-muted-foreground border border-transparent shadow-sm hover:text-foreground">
           <ArrowLeft size={16} className="mr-2" /> Directory Matrix
         </Button>
         <h2 className="text-2xl font-bold tracking-tight">Signal Analysis Module</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        
        {/* Core Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 border-b bg-muted/20 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl shadow-inner border border-border">
                 <svg ref={svgRef} className="w-full h-auto max-w-[240px] max-h-[100px]" />
              </div>
              <div className="mt-6 flex space-x-3 w-full">
                <Button variant="outline" className="flex-1 text-xs sm:text-sm font-semibold" onClick={() => barcodeUtils.print(asset.assetCode)}>
                  <Printer size={16} className="mr-2" /> Print Array
                </Button>
                <Button variant="secondary" className="flex-1 text-xs sm:text-sm font-semibold border" onClick={() => barcodeUtils.downloadAsPNG(asset.assetCode, asset.assetCode)}>
                  <Download size={16} className="mr-2" /> Export
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold">{asset.name}</h3>
                <p className="text-sm font-mono mt-1 text-muted-foreground break-all">{asset.assetCode}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <StatusBadge type={asset.type} />
                <StatusBadge status={asset.status} />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start">
                  <MapPin size={18} className="text-primary mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-1">Local Coordinates</p>
                    <p className="text-sm font-medium leading-relaxed bg-muted/40 p-2 rounded border border-border/50">{asset.locationPath}</p>
                  </div>
                </div>
                
                {isConsumable && (
                  <div className="flex items-start mt-4">
                    <Package size={18} className="text-primary mr-3 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-1">Volumetric Integrity</p>
                      <div className="flex justify-between items-end mb-1 mt-2">
                        <span className="text-sm font-bold text-foreground">{asset.quantity}</span>
                        <span className="text-xs text-muted-foreground font-semibold">of {asset.initialQuantity} capacity</span>
                      </div>
                      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                         <div className={`h-full rounded-full transition-all ${pct < 20 ? 'bg-destructive' : pct < 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-4">
                   <div>
                     <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Synthesized By</p>
                     <div className="flex items-center text-sm font-medium"><User size={14} className="mr-1"/> {asset.createdByName}</div>
                   </div>
                   <div>
                     <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Creation Log</p>
                     <div className="flex items-center text-sm font-medium"><Clock size={14} className="mr-1"/> {new Date(asset.createdAt).toLocaleDateString()}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {asset.status === 'disposed' && (
            <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-5 relative overflow-hidden group hover:border-destructive/40 transition-colors">
               <AlertTriangle className="absolute -right-4 -top-4 w-24 h-24 text-destructive/5 group-hover:scale-110 transition-transform" />
               <h3 className="font-bold text-destructive mb-3 relative z-10 flex items-center">
                 <Trash2 size={18} className="mr-2" /> Sub-System Severed Component
               </h3>
               <div className="space-y-2 relative z-10">
                 <p className="text-sm"><strong>Deactivated At:</strong> {new Date(asset.disposedAt).toLocaleString()}</p>
                 <p className="text-sm"><strong>Archived By Operator:</strong> {asset.disposedByName}</p>
                 {asset.disposalPhotoUrl && (
                   <div className="mt-4 pt-4 border-t border-destructive/20">
                     <p className="text-xs font-semibold uppercase mb-2 text-destructive">Termination Signature Target Image</p>
                     <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${asset.disposalPhotoUrl}`} target="_blank" rel="noopener noreferrer" className="block max-w-full rounded shadow-md border hover:opacity-90 transition-opacity">
                       <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${asset.disposalPhotoUrl}`} alt="Disposal Log" className="w-full h-auto rounded" />
                     </a>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Temporal Logs */}
        <div className="lg:col-span-2">
          <div className="bg-card shadow-sm border border-border rounded-xl h-full flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-muted/10">
              <h3 className="text-lg font-bold flex items-center">
                <Activity size={20} className="mr-2 text-primary" />
                Temporal Auditing Sequence
              </h3>
            </div>
            
            <div className="p-4 sm:p-6 flex-1 bg-gradient-to-b from-card to-muted/20">
              {!isConsumable ? (
                <div className="space-y-6">
                  {(!asset.movements || asset.movements.length === 0) ? (
                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                      <HardDrive size={32} className="mb-4 opacity-50" />
                      <p className="font-semibold text-lg">Immutable Stasis Lock</p>
                      <p className="text-sm max-w-[280px] mt-2">Zero coordinate shifts recorded. Unit locked perfectly to original deployment bay.</p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:w-0.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:bg-border/60">
                      {asset.movements.map((move: any, i: number) => (
                        <div key={move.id} className="relative flex items-start group">
                           <div className="absolute left-[-24px] rounded-full bg-primary/20 p-1.5 border-4 border-card group-hover:scale-110 group-hover:bg-primary transition-all">
                             <div className="w-2 h-2 rounded-full bg-primary" />
                           </div>
                           <div className="ml-6 bg-card border rounded-lg p-5 w-full shadow-sm group-hover:shadow hover:border-primary/40 transition-all">
                             <div className="flex justify-between items-start mb-2">
                               <p className="text-xs font-bold text-muted-foreground">{new Date(move.movedAt).toLocaleString()}</p>
                               <span className="text-xs bg-muted px-2 py-1 rounded-md font-semibold">{move.movedByName}</span>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center mt-4">
                               <div className="col-span-2 p-3 bg-muted/40 rounded border text-sm font-medium word-break border-dashed">
                                 {move.fromLocationPath || <span className="italic text-muted-foreground">Original Deployment Origin Void</span>}
                               </div>
                               <div className="hidden md:flex justify-center text-muted-foreground col-span-1">
                                 <ArrowLeft size={20} className="rotate-180 text-primary animate-pulse" />
                               </div>
                               <div className="col-span-2 p-3 bg-primary/5 rounded border border-primary/20 text-sm font-semibold text-primary word-break">
                                 {move.toLocationPath}
                               </div>
                             </div>
                             {move.notes && (
                               <div className="mt-4 p-3 bg-muted/30 text-sm rounded border-l-2 border-l-primary/40 text-muted-foreground flex items-start">
                                 <FileText size={14} className="mr-2 shrink-0 mt-0.5" />
                                 <p className="italic">{move.notes}</p>
                               </div>
                             )}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(!asset.usages || asset.usages.length === 0) ? (
                    <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
                      <Package size={32} className="mb-4 opacity-50" />
                      <p className="font-semibold text-lg">Pristine Component Integrity</p>
                      <p className="text-sm max-w-[280px] mt-2">Resource allocation completely untouched. Subsystem retains maximum base capacity.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border shadow-sm overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 border-b font-medium text-xs tracking-widest text-muted-foreground uppercase">
                          <tr>
                            <th className="px-4 py-3">Timestamp Stamp</th>
                            <th className="px-4 py-3">Delta Payload</th>
                            <th className="px-4 py-3 text-center">Offset Metric</th>
                            <th className="px-4 py-3">Engineer Trace</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {asset.usages.map((use: any) => (
                            <tr key={use.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3 font-semibold text-xs whitespace-nowrap">{new Date(use.usedAt).toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="destructive" className="font-mono text-xs font-bold leading-none py-1 h-auto px-2 border-red-500/30">-{use.quantityUsed}</Badge>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="inline-flex items-center space-x-2 bg-muted/60 p-1.5 rounded-md border font-mono text-xs">
                                  <span>{use.quantityBefore}</span>
                                  <ArrowLeft size={10} className="rotate-180" />
                                  <span className={use.quantityAfter === 0 ? "text-destructive font-black" : "text-emerald-600 font-bold"}>
                                    {use.quantityAfter}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium whitespace-nowrap">{use.updatedByName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
