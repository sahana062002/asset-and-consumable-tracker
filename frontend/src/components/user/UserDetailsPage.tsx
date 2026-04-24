import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Shield, Clock, Mail, ShieldAlert, History } from 'lucide-react';

interface UserDetailsPageUIProps {
  userData: any;
  activity: any[];
  isLoading: boolean;
  onNavigateBack: () => void;
}

export default function UserDetailsPageUI({
  userData,
  activity = [],
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
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-4 border-background shadow-md text-primary text-4xl font-black uppercase ring-2 ring-primary/20">
                {userData?.name ? userData.name.charAt(0) : <User size={40} />}
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{userData?.name || 'Unknown Identity'}</h2>
              <div className="flex items-center mt-3 space-x-2">
                <Badge variant={userData?.role === 'admin' ? 'default' : 'secondary'} className={`px-3 py-1 ${userData?.role === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}>
                  {userData?.role === 'admin' ? <Shield size={12} className="mr-1.5" /> : <User size={12} className="mr-1.5" />}
                  <span className="uppercase tracking-wider text-[10px] font-bold">{userData?.role}</span>
                </Badge>
                
              </div>
            </div>
            
            <div className="p-6 space-y-6 bg-card">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-70">Access Point (Email)</Label>
                <div className="flex items-center text-sm font-semibold text-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                  <Mail size={14} className="mr-2.5 text-primary" />
                  {userData?.email || 'unconfigured@system.local'}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-70">Enlisted On</Label>
                <div className="flex items-center text-sm font-semibold text-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                  <Clock size={14} className="mr-2.5 text-primary" />
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Date Unknown'}
                </div>
              </div>

              
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden h-full min-h-[400px] flex flex-col">
             <div className="px-6 py-4 border-b bg-muted/10 flex items-center justify-between">
               <div className="flex items-center">
                 <History size={18} className="mr-2 text-primary" />
                 <h3 className="font-bold text-sm uppercase tracking-tight">System Activity Stream</h3>
               </div>
               <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Live Telemetry</Badge>
             </div>
             <div className="flex-1 overflow-y-auto">
               {activity.length > 0 ? (
                 <div className="divide-y divide-border">
                   {activity.map((log, idx) => (
                     <div key={idx} className="p-4 hover:bg-muted/30 transition-colors flex items-start space-x-4 group">
                       <div className={`mt-1 p-2 rounded-lg ${log.type === 'movement' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                         {log.type === 'movement' ? <ArrowLeft className="rotate-180" size={16} /> : <History size={16} />}
                       </div>
                       <div className="flex-1 space-y-1">
                         <div className="flex items-center justify-between">
                           <p className="text-sm font-bold group-hover:text-primary transition-colors">{log.assetName}</p>
                           <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <p className="text-xs text-muted-foreground leading-relaxed">{log.details}</p>
                         <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-tighter">{log.assetCode} • {new Date(log.timestamp).toLocaleDateString()}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-full">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 relative">
                       <History size={32} className="opacity-20" />
                       <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    </div>
                    <p className="font-bold text-lg text-foreground mb-2">No Active Logs Detected</p>
                    <p className="text-xs max-w-xs mx-auto leading-relaxed">
                      This identity has not generated any recent asset movements or stock updates. 
                      All operational activity will appear here in real-time once recorded.
                    </p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
