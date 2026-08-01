import { useQuery } from '@tanstack/react-query';
import { Server, Database, Flame, Radio } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSystemHealth } from '@/features/dashboard/api';

export function SystemPage() {
  const health = useQuery({ queryKey: ['system', 'health'], queryFn: getSystemHealth, refetchInterval: 15_000 });

  return (
    <div>
      <PageHeader title="System" description="Live status of backend infrastructure." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard icon={Server} label="Backend API" ok={health.data?.status === 'ok'} loading={health.isLoading} detail="Next.js on /api/health" />
        <StatusCard icon={Database} label="MongoDB" ok={health.data?.db === 'connected'} loading={health.isLoading} detail="Mongoose connection pool" />
        <StatusCard icon={Flame} label="Firebase RTDB" ok={undefined} loading={false} detail="No health endpoint yet — see BACKEND_REQUIREMENTS.md" />
        <StatusCard icon={Radio} label="FCM Push" ok={undefined} loading={false} detail="No health endpoint yet — see BACKEND_REQUIREMENTS.md" />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Raw response — GET /api/health</CardTitle>
        </CardHeader>
        <CardContent>
          {health.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <pre className="overflow-auto rounded-lg bg-secondary/50 p-4 font-mono text-xs">{JSON.stringify(health.data, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  ok,
  loading,
  detail,
}: {
  icon: typeof Server;
  label: string;
  ok?: boolean;
  loading: boolean;
  detail: string;
}) {
  const known = ok !== undefined;
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <Skeleton className="h-5 w-16" />
          ) : known ? (
            <span className={`flex items-center gap-1.5 text-xs font-bold ${ok ? '[color:hsl(var(--success))]' : '[color:hsl(var(--destructive))]'}`}>
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${ok ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--destructive))]'}`} />
              {ok ? 'Operational' : 'Down'}
            </span>
          ) : (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">No endpoint</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
