import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  loading?: boolean;
  accent?: 'primary' | 'success' | 'warning' | 'destructive' | 'default';
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/12 [color:hsl(var(--primary))]',
  success: 'bg-success/12 [color:hsl(var(--success))]',
  warning: 'bg-warning/12 [color:hsl(var(--warning))]',
  destructive: 'bg-destructive/12 [color:hsl(var(--destructive))]',
  default: 'bg-secondary text-foreground',
};

export function StatCard({ label, value, sub, icon: Icon, loading, accent = 'default' }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-raised">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
          )}
          {sub && !loading && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', ACCENT_STYLES[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
