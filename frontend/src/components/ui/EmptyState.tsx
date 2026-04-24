import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-xl border border-dashed border-border min-h-[400px]">
      <div className="text-muted-foreground mb-5 h-16 w-16 flex items-center justify-center rounded-full bg-muted/60 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-[420px] text-sm md:text-base leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
