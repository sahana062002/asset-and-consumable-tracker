import { Badge } from '@/components/ui/badge'; 

interface StatusBadgeProps {
  status?: 'active' | 'disposed';
  type?: 'fixed' | 'consumable';
  children?: React.ReactNode;
}

export function StatusBadge({ status, type, children }: StatusBadgeProps) {
  if (status) {
    if (status === 'active') return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>;
    return <Badge variant="destructive">Disposed</Badge>;
  }
  if (type) {
    if (type === 'fixed') return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Fixed</Badge>;
    return <Badge variant="secondary">Consumable</Badge>;
  }
  return <Badge>{children}</Badge>;
}
