import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Shield, Clock, Mail, ShieldAlert, History } from 'lucide-react';

interface UserDetailsPageUIProps {
  userData: any;
  isLoading: boolean;
  onNavigateBack: () => void;
}

export default function UserDetailsPageUI({
  userData,
  isLoading,
  onNavigateBack
}: UserDetailsPageUIProps) {
  if (isLoading) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onNavigateBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} className="mr-2" /> Back to Personnel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl overflow-hidden shadow-lg border-t-4 border-t-primary">
            <div className="p-8 border-b bg-muted/20 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20 text-primary text-4xl font-black uppercase">
                {userData?.name?.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold">{userData?.name}</h2>
              <div className="flex items-center mt-2 space-x-2">
                <Badge variant={userData?.role === 'admin' ? 'default' : 'secondary'} className={userData?.role === 'admin' ? 'bg-purple-600' : ''}>
                  {userData?.role === 'admin' ? <Shield size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                  {userData?.role}
                </Badge>
                <Badge variant="outline" className={userData?.isActive ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-destructive border-destructive/20 bg-destructive/5'}>
                  {userData?.isActive ? 'Operational' : 'Suspended'}
                </Badge>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Digital Address</Label>
                <div className="flex items-center text-sm font-medium">
                  <Mail size={14} className="mr-2 text-primary opacity-70" />
                  {userData?.email}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Enlisted On</Label>
                <div className="flex items-center text-sm font-medium">
                  <Clock size={14} className="mr-2 text-primary opacity-70" />
                  {new Date(userData?.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>

              <div className="pt-4 border-t">
                 <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-tighter italic">Unique Identifier ID: {userData?.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
             <div className="p-4 border-b bg-muted/10 flex items-center">
               <History size={18} className="mr-2 text-primary" />
               <h3 className="font-bold">Operational Audit Log</h3>
             </div>
             <div className="p-12 text-center text-muted-foreground">
                <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-lg">Sub-system Encrypted</p>
                <p className="text-sm max-w-sm mx-auto mt-2">Audit log telemetry for specific nodes is currently undergoing batch processing. Individual user activity streams will appear here shortly.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
