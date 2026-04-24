import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield, User as UserIcon, Edit, Lock, Trash2, Eye, EyeOff } from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters').optional(),
  role: z.enum(['admin', 'user']),
  isActive: z.boolean().optional()
});

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  const [dialogState, setDialogState] = useState<'create' | 'edit' | 'reset' | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [showPwd, setShowPwd] = useState(false);

  const { data: usersData, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list() });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'user', isActive: true }
  });

  const { register: registerReset, handleSubmit: handleResetSubmit, reset: resetPasswordForm, formState: { errors: resetErrors, isSubmitting: isResetting } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => {
      success('User provisioned effectively.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeDialog();
    },
    onError: (err: any) => error('Failed', err.response?.data?.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(activeUser.id, data),
    onSuccess: () => {
      success('Metadata updated.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeDialog();
    },
    onError: (err: any) => error('Failed', err.response?.data?.message)
  });

  const resetMutation = useMutation({
    mutationFn: (data: any) => usersApi.resetPassword(activeUser.id, data),
    onSuccess: () => {
      success('Security lock overridden successfully.');
      closeDialog();
    },
    onError: (err: any) => error('Failed', err.response?.data?.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      success('User suspended safely.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => error('Failed', err.response?.data?.message)
  });

  const openCreate = () => {
    setActiveUser(null);
    reset({ name: '', email: '', password: '', role: 'user', isActive: true });
    setDialogState('create');
  };

  const openEdit = (u: any) => {
    setActiveUser(u);
    reset({ name: u.name, email: u.email, role: u.role, isActive: u.isActive, password: '' });
    setDialogState('edit');
  };

  const openReset = (u: any) => {
    setActiveUser(u);
    resetPasswordForm({ newPassword: '', confirmPassword: '' });
    setDialogState('reset');
  };

  const closeDialog = () => {
    setDialogState(null);
    setTimeout(() => setActiveUser(null), 200);
  };

  const onSubmit = (data: any) => {
    if (dialogState === 'edit') {
      const payload: any = { name: data.name, email: data.email, role: data.role, isActive: data.isActive };
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(data);
    }
  };

  const onResetSubmit = (data: any) => {
    resetMutation.mutate({ newPassword: data.newPassword });
  };

  const columns = [
    { 
      header: 'Identity', 
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      ) 
    },
    { 
      header: 'Clearance Role', 
      accessor: (row: any) => (
        <Badge variant={row.role === 'admin' ? 'default' : 'secondary'} className={row.role === 'admin' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'}>
          {row.role === 'admin' ? <Shield size={12} className="mr-1" /> : <UserIcon size={12} className="mr-1" />}
          {row.role}
        </Badge>
      ) 
    },
    { 
      header: 'Account Status', 
      accessor: (row: any) => (
        <Badge variant="outline" className={row.isActive ? 'text-emerald-600 border-emerald-600' : 'text-red-500 border-red-500'}>
          {row.isActive ? 'Active' : 'Suspended'}
        </Badge>
      ) 
    },
    { 
      header: 'Joined Timeline', 
      accessor: (row: any) => <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span> 
    },
    {
      header: 'Access Management',
      accessor: (row: any) => (
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)} title="Edit Configuration">
            <Edit size={16} className="text-muted-foreground hover:text-foreground" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openReset(row)} title="Force Reset Password">
            <Lock size={16} className="text-muted-foreground hover:text-foreground" />
          </Button>
          <ConfirmDialog 
            title="Suspend User Privileges"
            description={`Are you sure you want to lock ${row.name} out of their account?`}
            onConfirm={() => deleteMutation.mutate(row.id)}
            variant="destructive"
            trigger={
              <Button variant="ghost" size="sm" disabled={row.id === currentUser?.id} title="Suspend User">
                <Trash2 size={16} className={row.id === currentUser?.id ? "opacity-30" : "text-destructive"} />
              </Button>
            }
          />
        </div>
      )
    }
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader 
        title="Fleet User Management" 
        subtitle="Administer organizational employee authentications, security roles, and deep application access tiers."
        action={
           <Button onClick={openCreate} className="shadow-lg hover:shadow-xl transition-all">
             <UserPlus size={18} className="mr-2" />
             Provision Account
           </Button>
        }
      />

      <DataTable data={usersData?.data || []} columns={columns} />

      {/* Main Universal Modal Render Target for strict isolated states */}
      {dialogState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={closeDialog}>
           <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden zoom-in-95 animate-in duration-200" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b bg-muted/10">
               <h2 className="text-2xl font-bold tracking-tight">
                 {dialogState === 'create' ? 'Provision Identity' : dialogState === 'edit' ? 'Modify Clearance' : 'Security Override'}
               </h2>
               <p className="text-sm text-muted-foreground mt-1">Configure parameters safely.</p>
             </div>
             
             <div className="p-6">
               {(dialogState === 'edit' || dialogState === 'create') && (
                 <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                   <div className="space-y-2">
                     <Label>Legal Full Name</Label>
                     <Input {...register('name')} placeholder="John Doe" />
                     {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                   </div>
                   
                   <div className="space-y-2">
                     <Label>Corp Email Address</Label>
                     <Input {...register('email')} type="email" placeholder="email@company.com" />
                     {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                   </div>

                   {dialogState === 'create' && (
                     <div className="space-y-2 relative">
                       <Label>Initial Password Security</Label>
                       <div className="relative">
                         <Input {...register('password')} type={showPwd ? "text" : "password"} className="pr-10" />
                         <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2 text-muted-foreground">
                           {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                         </button>
                       </div>
                       {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
                     </div>
                   )}

                   <div className="space-y-2">
                     <Label>System Role Configuration</Label>
                     <select {...register('role')} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                       <option value="user">Floor Employee (User)</option>
                       <option value="admin">System Architect (Admin)</option>
                     </select>
                   </div>

                   {dialogState === 'edit' && activeUser?.id !== currentUser?.id && (
                     <div className="flex items-center space-x-2 pt-2 border-t mt-4 border-border">
                       <input type="checkbox" id="active" {...register('isActive')} className="w-4 h-4 rounded text-primary" defaultChecked={activeUser?.isActive} />
                       <Label htmlFor="active" className="font-semibold text-foreground cursor-pointer">Account Operating Live</Label>
                     </div>
                   )}
                 </form>
               )}

               {dialogState === 'reset' && (
                 <form id="reset-form" onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
                   <div className="space-y-2">
                     <Label>Emergency New Core Password</Label>
                     <Input {...registerReset('newPassword')} type="password" />
                     {resetErrors.newPassword && <p className="text-xs text-destructive">{resetErrors.newPassword.message as string}</p>}
                   </div>
                   <div className="space-y-2">
                     <Label>Verify Password Payload</Label>
                     <Input {...registerReset('confirmPassword')} type="password" />
                     {resetErrors.confirmPassword && <p className="text-xs text-destructive">{resetErrors.confirmPassword.message as string}</p>}
                   </div>
                 </form>
               )}
             </div>

             <div className="p-6 bg-muted/40 border-t flex justify-end space-x-3 rounded-b-2xl">
               <Button variant="ghost" onClick={closeDialog} type="button">Escape</Button>
               <Button 
                form={dialogState === 'reset' ? "reset-form" : "user-form"} 
                type="submit" 
                disabled={isSubmitting || isResetting || createMutation.isPending || updateMutation.isPending || resetMutation.isPending}
                className="shadow-md font-semibold"
               >
                 Integrate Node
               </Button>
             </div>
           </div>
        </div>
      )}
    </>
  );
}
