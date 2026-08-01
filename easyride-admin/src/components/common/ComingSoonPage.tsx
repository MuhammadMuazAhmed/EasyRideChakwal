import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  icon?: LucideIcon;
  requiredEndpoints: string[];
  note?: string;
}

export function ComingSoonPage({ title, icon: Icon = Construction, requiredEndpoints, note }: ComingSoonPageProps) {
  return (
    <div>
      <PageHeader title={title} description="This module is scaffolded and ready to wire up — it's waiting on backend endpoints." />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12">
            <Icon className="h-7 w-7 [color:hsl(var(--primary))]" />
          </div>
          <div className="max-w-md">
            <p className="text-sm font-semibold">Not built yet — by design, not by accident</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {note ?? 'This screen intentionally shows no data instead of fabricated numbers. Add the endpoints below to easy-ride-backend and this page lights up.'}
            </p>
          </div>
          <div className="w-full max-w-md rounded-lg border border-border bg-secondary/40 p-4 text-left">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Required backend endpoints</p>
            <ul className="space-y-1.5">
              {requiredEndpoints.map((ep) => (
                <li key={ep} className="font-mono text-xs text-foreground">
                  {ep}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">Full specs in <span className="font-mono">BACKEND_REQUIREMENTS.md</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
