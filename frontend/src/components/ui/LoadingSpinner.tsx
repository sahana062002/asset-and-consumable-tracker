import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh] animate-in fade-in duration-500">
      <Loader2 className={`h-10 w-10 animate-spin text-primary opacity-60 ${className || ''}`} />
    </div>
  );
}
