import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { locationsApi } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Map, Building2, Layers, AlignJustify, Box, Edit, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';
// standard shadcn ui assumptions
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const LEVEL_CONFIG = {
  campus: { icon: Map, color: 'text-stone-500', bg: 'bg-stone-500/10' },
  building: { icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  floor: { icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  room: { icon: AlignJustify, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  shelf: { icon: Box, color: 'text-orange-500', bg: 'bg-orange-500/10' }
};
const LEVELS = ['campus', 'building', 'floor', 'room', 'shelf'] as const;

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  level: z.enum(LEVELS),
  parentId: z.string().optional().nullable()
});

function LocationTreeNode({ node, onEdit, onDelete, onAddChild }: any) {
  const [expanded, setExpanded] = useState(false);
  const config = LEVEL_CONFIG[node.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.shelf;
  const Icon = config.icon;

  return (
    <div className="ml-4 mt-2">
      <div className="flex items-center p-2 rounded-md hover:bg-muted/60 group transition-colors border border-transparent">
        <button 
          className="w-6 h-6 flex items-center justify-center mr-1 text-muted-foreground hover:text-foreground" 
          onClick={() => setExpanded(!expanded)}
        >
          {node.children?.length > 0 ? (expanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>) : <span className="w-4 h-4" />}
        </button>
        
        <div className={`p-1.5 rounded-md ${config.bg} mr-3`}>
          <Icon size={16} className={config.color} />
        </div>
        
        <span className="font-semibold mr-3">{node.name}</span>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mr-auto">{node.level}</Badge>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
          {node.level !== 'shelf' && (
            <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => onAddChild(node)}>
              <Plus size={14} className="mr-1" /> Child
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(node)}>
            <Edit size={14} className="text-muted-foreground hover:text-foreground" />
          </Button>
          <ConfirmDialog 
            title="Delete Location"
            description={`Are you sure you want to delete ${node.name}? This action cannot be undone.`}
            onConfirm={() => onDelete(node.id)}
            variant="destructive"
            trigger={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive">
                <Trash2 size={14} />
              </Button>
            }
          />
        </div>
      </div>

      {expanded && node.children?.length > 0 && (
        <div className="border-l-2 border-border ml-3 pl-2 mt-1">
          {node.children.map((child: any) => (
             <LocationTreeNode key={child.id} node={child} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocationsPage() {
  const [view, setView] = useState<'tree' | 'flat'>('tree');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: treeData, isLoading: treeLoading } = useQuery({ queryKey: ['locations-tree'], queryFn: () => locationsApi.getTree() });
  const { data: flatData, isLoading: flatLoading } = useQuery({ queryKey: ['locations-flat'], queryFn: () => locationsApi.getFlat() });

  const { register, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: '', level: 'campus', parentId: '' }
  });

  const selectedLevel = watch('level');
  
  // Filter valid parents dynamically
  const validParents = flatData?.data?.filter((l: any) => {
    const targetIdx = LEVELS.indexOf(selectedLevel as any);
    const parentIdx = LEVELS.indexOf(l.level);
    return targetIdx === parentIdx + 1;
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => locationsApi.create({ ...data, parentId: data.parentId ? Number(data.parentId) : undefined }),
    onSuccess: () => {
      success('Location added successfully');
      queryClient.invalidateQueries({ queryKey: ['locations-tree'] });
      queryClient.invalidateQueries({ queryKey: ['locations-flat'] });
      closeDialog();
    },
    onError: (err: any) => error('Failed to create', err.response?.data?.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => locationsApi.update(editingLocation.id, { ...data, parentId: data.parentId ? Number(data.parentId) : undefined }),
    onSuccess: () => {
      success('Location updated successfully');
      queryClient.invalidateQueries({ queryKey: ['locations-tree'] });
      queryClient.invalidateQueries({ queryKey: ['locations-flat'] });
      closeDialog();
    },
    onError: (err: any) => error('Failed to update', err.response?.data?.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => locationsApi.remove(id),
    onSuccess: () => {
      success('Location deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['locations-tree'] });
      queryClient.invalidateQueries({ queryKey: ['locations-flat'] });
    },
    onError: (err: any) => error('Delete failed', err.response?.data?.message)
  });

  const openAddChild = (parentNode: any) => {
    setEditingLocation(null);
    const parentIdx = LEVELS.indexOf(parentNode.level);
    const childLevel = LEVELS[parentIdx + 1];
    reset({ name: '', level: childLevel, parentId: String(parentNode.id) });
    setDialogOpen(true);
  };

  const openEdit = (node: any) => {
    setEditingLocation(node);
    reset({ name: node.name, level: node.level, parentId: node.parentId ? String(node.parentId) : '' });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingLocation(null);
    reset({ name: '', level: 'campus', parentId: '' });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setEditingLocation(null), 200);
  };

  const onSubmit = (data: any) => {
    if (editingLocation) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (treeLoading || flatLoading) return <LoadingSpinner />;

  const columns = [
    { header: 'Full Path', accessor: 'path' as keyof any },
    { 
      header: 'Level', 
      accessor: (row: any) => <Badge variant="outline" className="uppercase">{row.level}</Badge> 
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <ConfirmDialog 
            title="Delete Location"
            description={`Delete ${row.name}?`}
            onConfirm={() => deleteMutation.mutate(row.id)}
            variant="destructive"
            trigger={<Button variant="ghost" size="sm" className="text-destructive">Delete</Button>}
          />
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Location Hierarchy" 
        subtitle="Manage campuses, physical buildings, sub-floors, specific rooms, and individual storage shelves."
        action={
           <Button onClick={openCreate} className="shadow-md">
             <Plus size={16} className="mr-2" />
             Add Location
           </Button>
        }
      />

      <div className="mb-4 flex space-x-2 border-b border-border pb-px">
        <button 
          onClick={() => setView('tree')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${view === 'tree' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Interactive Tree
        </button>
        <button 
          onClick={() => setView('flat')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${view === 'flat' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Flat Browser
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border mt-4">
        {view === 'tree' ? (
          <div className="p-4 md:p-6 min-h-[400px]">
            {treeData?.data?.length === 0 ? (
              <EmptyState 
                icon={<Map size={24} />} 
                title="No Ecosystem" 
                description="Start building your physical infrastructure map by creating a Master Campus." 
                action={<Button onClick={openCreate}>Create Campus</Button>}
              />
            ) : (
              <div>
                {treeData?.data?.map((node: any) => (
                  <LocationTreeNode key={node.id} node={node} onEdit={openEdit} onDelete={(id: number) => deleteMutation.mutate(id)} onAddChild={openAddChild} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <DataTable data={flatData?.data || []} columns={columns} />
          </div>
        )}
      </div>

      {/* Basic Dialog Wrapper implementation */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeDialog}>
           <div className="bg-card w-full max-w-md rounded-xl shadow-xl border overflow-hidden zoom-in-95 animate-in duration-200" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b">
               <h2 className="text-xl font-bold">{editingLocation ? 'Edit Location' : 'Build New Location'}</h2>
               <p className="text-sm text-muted-foreground mt-1">Configure physical storage boundaries in real space.</p>
             </div>
             
             <div className="p-6">
               <form id="hook-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                 
                 <div className="space-y-2">
                   <Label>Name</Label>
                   <Input {...register('name')} placeholder="e.g. Science Block C" className={errors.name ? 'border-destructive' : ''} />
                   {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                 </div>

                 <div className="space-y-2">
                   <Label>Security / Hierarchy Level</Label>
                   <select 
                     {...register('level')} 
                     className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                   >
                     <option value="campus">Campus 🏛️</option>
                     <option value="building">Building 🏢</option>
                     <option value="floor">Floor 🏗️</option>
                     <option value="room">Room 🚪</option>
                     <option value="shelf">Shelf 📦</option>
                   </select>
                 </div>

                 {selectedLevel !== 'campus' && (
                   <div className="space-y-2">
                     <Label>Master Parent Map</Label>
                     <select 
                       {...register('parentId')} 
                       className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                     >
                       <option value="">-- Select Parent Element --</option>
                       {validParents?.map((p: any) => (
                         <option key={p.id} value={p.id}>{p.path}</option>
                       ))}
                     </select>
                     {errors.parentId && <p className="text-xs text-destructive">{errors.parentId.message as string}</p>}
                   </div>
                 )}
               </form>
             </div>

             <div className="p-6 bg-muted/30 border-t flex justify-end space-x-2">
               <Button variant="outline" onClick={closeDialog} type="button">Cancel</Button>
               <Button form="hook-form" type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                 {isSubmitting ? 'Saving...' : 'Confirm'}
               </Button>
             </div>
           </div>
        </div>
      )}
    </>
  );
}
