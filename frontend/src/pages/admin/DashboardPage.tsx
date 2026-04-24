import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assetsApi, locationsApi } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MapPin, Box, DatabaseZap, ShieldAlert, Cpu, Activity, FolderPath, Layers, ChevronRight, ChevronDown, CheckSquare, Square } from 'lucide-react';

// Recursive helper to extract all node IDs mapped statically below a certain parent
const extractAllChildIds = (node: any): number[] => {
  let ids = [node.id];
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      ids = [...ids, ...extractAllChildIds(child)];
    });
  }
  return ids;
};

// Tree node component
const LocationTreeNode = ({ node, selectedIds, onSelect, onDeselect, depth = 0 }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedIds.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const affectedIds = extractAllChildIds(node);
    if (isSelected) {
      onDeselect(affectedIds);
    } else {
      onSelect(affectedIds);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`flex items-center py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors group ${isSelected ? 'bg-primary/5 text-primary' : ''}`}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        onClick={(e) => {
           if (hasChildren) setIsExpanded(!isExpanded);
           else handleToggle(e);
        }}
      >
        <div className="mr-1 w-4 h-4 flex items-center justify-center text-muted-foreground group-hover:text-foreground">
           {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span />}
        </div>
        
        <div onClick={handleToggle} className="mr-2 text-primary hover:scale-110 transition-transform">
          {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-muted-foreground opacity-50" />}
        </div>
        
        <span className="font-semibold text-sm truncate mr-2">{node.name}</span>
        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 uppercase ${isSelected ? 'border-primary/30' : ''}`}>{node.level}</Badge>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-0.5">
          {node.children.map((child: any) => (
            <LocationTreeNode 
              key={child.id} 
              node={child} 
              selectedIds={selectedIds} 
              onSelect={onSelect} 
              onDeselect={onDeselect} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

  const { data: assetsData, isLoading: assetsLoading } = useQuery({ queryKey: ['assets'], queryFn: () => assetsApi.list() });
  const { data: treeData, isLoading: treeLoading } = useQuery({ queryKey: ['locations-tree'], queryFn: () => locationsApi.getTree() });

  const assets = assetsData?.data || [];
  const locationTree = treeData?.data || [];

  const handleSelectLocations = (ids: number[]) => {
    setSelectedLocationIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectLocations = (idsToRemove: number[]) => {
    setSelectedLocationIds(prev => prev.filter(id => !idsToRemove.includes(id)));
  };
  
  const handleClearSelection = () => setSelectedLocationIds([]);

  // KPIs
  const totalAssets = assets.length;
  const activeFixed = assets.filter((a: any) => a.type === 'fixed' && a.status === 'active').length;
  const activeConsumable = assets.filter((a: any) => a.type === 'consumable' && a.status === 'active').length;
  const disposedAssets = assets.filter((a: any) => a.status === 'disposed').length;

  // Rendered Matrix filter
  const visibleAssets = useMemo(() => {
    if (selectedLocationIds.length === 0) return assets;
    return assets.filter((a: any) => selectedLocationIds.includes(a.locationId));
  }, [assets, selectedLocationIds]);

  if (assetsLoading || treeLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Central Telemetry Dashboard</h2>
        <p className="text-muted-foreground text-sm">Real-time macro visualization of tracking network topological distributions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Gross Fleet Node Count</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Total indexed system artifacts</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Fixed Physical Nodes</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-blue-600">{activeFixed}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Active operational status</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Fluid Consumables</CardTitle>
            <DatabaseZap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-orange-600">{activeConsumable}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Active volume modules</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-destructive hover:shadow-md transition-shadow bg-destructive/5 text-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-destructive">Severed Nodes</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{disposedAssets}</div>
            <p className="text-xs opacity-80 mt-1 font-semibold">Disposed or fully consumed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
        {/* Topology Filter */}
        <Card className="lg:col-span-1 shadow-sm border border-border h-[600px] flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4 shrink-0">
            <CardTitle className="flex items-center text-md font-bold">
              <Layers size={18} className="mr-2 text-primary" /> Mapping Hierarchy
            </CardTitle>
            <CardDescription className="text-xs font-semibold mt-1">
              Recursively select coordinate zones to isolate tracking matrices.
            </CardDescription>
            {selectedLocationIds.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearSelection} className="w-full mt-3 h-8 text-xs font-bold shadow-sm">
                Clear Filters ({selectedLocationIds.length} Nodes Locked)
              </Button>
            )}
          </CardHeader>
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-card to-muted/10">
            {locationTree.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                 <MapPin className="mx-auto mb-2 opacity-20" size={32} />
                 <p className="text-sm font-semibold">No topology loaded.</p>
              </div>
            ) : (
              <div className="space-y-1 pb-10">
                {locationTree.map((node: any) => (
                   <LocationTreeNode 
                      key={node.id} 
                      node={node} 
                      selectedIds={selectedLocationIds} 
                      onSelect={handleSelectLocations} 
                      onDeselect={handleDeselectLocations} 
                   />
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Asset Matrix */}
        <Card className="lg:col-span-3 shadow-md border-t-4 border-t-primary h-[600px] flex flex-col bg-card/50">
          <CardHeader className="bg-muted/10 border-b pb-4 shrink-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center font-bold">
                 <Cpu size={20} className="mr-2 text-primary" /> Active Sensor Matrix
              </CardTitle>
              <CardDescription className="font-semibold text-xs mt-1">
                 {selectedLocationIds.length === 0 ? "Displaying global infrastructure layout." : "Matrix successfully filtered to selected topologies."}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="font-mono text-sm shadow-sm">{visibleAssets.length} Arrays Active</Badge>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-6 relative">
            {visibleAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center h-full">
                <ShieldAlert size={48} className="text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-xl font-bold tracking-tight">Zero Arrays Detected</h3>
                <p className="text-muted-foreground max-w-sm mt-2 text-sm font-medium">There are no operational or severed network components inside this specific geometrical footprint.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8 line-clamp-none">
                {visibleAssets.map((asset: any) => (
                  <div 
                    key={asset.id} 
                    onClick={() => navigate(`/dashboard/assets/${asset.id}`)}
                    className="group bg-card shadow-sm border border-border/60 hover:border-primary/50 rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between hover:bg-muted/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full transition-colors ${asset.status === 'disposed' ? 'bg-destructive' : 'bg-primary'}" />
                    <div>
                      <div className="flex justify-between items-start mb-3">
                         <div className={`p-2 rounded-lg border shadow-sm ${asset.type === 'consumable' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                           {asset.type === 'consumable' ? <DatabaseZap size={18} className="text-orange-600" /> : <Box size={18} className="text-blue-600" />}
                         </div>
                         <StatusBadge status={asset.status} />
                      </div>
                      <h3 className="font-bold text-[15px] leading-tight group-hover:text-primary transition-colors pr-4">{asset.name}</h3>
                      <p className="font-mono text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded border inline-block mt-2 font-bold tracking-widest uppercase">
                        {asset.assetCode}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-start text-xs text-muted-foreground font-semibold">
                         <MapPin size={12} className="mr-1.5 mt-0.5 shrink-0" />
                         <span className="truncate" title={asset.locationPath}>{asset.locationPath}</span>
                      </div>
                      
                      {asset.type === 'consumable' && asset.initialQuantity && (
                        <div>
                          <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Volumetric Flow</span>
                            <span>{asset.quantity}/{asset.initialQuantity}</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${asset.status === 'disposed' ? 'bg-destructive/40' : ((asset.quantity/asset.initialQuantity) < 0.25 ? 'bg-destructive' : 'bg-primary')}`} 
                              style={{ width: `${Math.max(0, (asset.quantity/asset.initialQuantity)*100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
