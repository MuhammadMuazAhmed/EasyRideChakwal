import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Car, Users, Route, CheckCircle2, XCircle, Radio, ShieldCheck, TrendingUp, Server, Database } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { QueryErrorState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RideStatusBadge, DriverStatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getDashboardSnapshot, getSystemHealth } from '@/features/dashboard/api';
import { formatPKR, initialsOf, titleCase } from '@/lib/utils';
import { isRidePartyRef } from '@/lib/type-guards';

export function DashboardPage() {
  const snapshot = useQuery({ queryKey: ['dashboard', 'snapshot'], queryFn: getDashboardSnapshot });
  const health = useQuery({ queryKey: ['dashboard', 'health'], queryFn: getSystemHealth, refetchInterval: 30_000 });

  return (
    <div>
      <PageHeader title="Dashboard" description="Live operational overview of EasyRide Chakwal." />

      {snapshot.isError ? (
        <QueryErrorState error={snapshot.error} onRetry={() => snapshot.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Drivers"
              value={snapshot.data?.drivers.total ?? 0}
              sub={`${snapshot.data?.drivers.online ?? 0} online now`}
              icon={Car}
              accent="primary"
              loading={snapshot.isLoading}
            />
            <StatCard
              label="Online Drivers"
              value={snapshot.data?.drivers.online ?? 0}
              sub="Available for rides"
              icon={Radio}
              accent="success"
              loading={snapshot.isLoading}
            />
            <StatCard
              label="Pending Verification"
              value={snapshot.data?.drivers.pendingVerification ?? 0}
              sub="Need admin review"
              icon={ShieldCheck}
              accent={snapshot.data && snapshot.data.drivers.pendingVerification > 0 ? 'warning' : 'default'}
              loading={snapshot.isLoading}
            />
            <StatCard
              label="Active Trips"
              value={snapshot.data?.rides.active ?? 0}
              sub={`${snapshot.data?.rides.searching ?? 0} searching for a driver`}
              icon={Route}
              accent="primary"
              loading={snapshot.isLoading}
            />
            <StatCard
              label="Total Trips"
              value={snapshot.data?.rides.total ?? 0}
              sub="All-time, all statuses"
              icon={TrendingUp}
              loading={snapshot.isLoading}
            />
            <StatCard
              label="Completed Trips"
              value={snapshot.data?.rides.completed ?? 0}
              icon={CheckCircle2}
              accent="success"
              loading={snapshot.isLoading}
            />
            <StatCard
              label="Cancelled Trips"
              value={snapshot.data?.rides.cancelled ?? 0}
              icon={XCircle}
              accent="destructive"
              loading={snapshot.isLoading}
            />
            <StatCard
              label="Total Riders"
              value="—"
              sub="Needs GET /api/riders"
              icon={Users}
              loading={false}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Recent Trips</CardTitle>
                <Link to="/rides" className="text-xs font-semibold [color:hsl(var(--primary))] hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {snapshot.isLoading ? (
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : snapshot.data?.recentRides.length ? (
                  <div className="divide-y divide-border">
                    {snapshot.data.recentRides.map((ride) => (
                      <Link
                        key={ride._id}
                        to={`/rides/${ride._id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-secondary/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {ride.pickup.name} → {ride.destination.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isRidePartyRef(ride.riderId) ? `${ride.riderId.firstName} ${ride.riderId.lastName}` : 'Rider'} ·{' '}
                            {formatPKR(ride.fare || ride.estimatedFare)}
                          </p>
                        </div>
                        <RideStatusBadge status={ride.status} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="p-5 text-sm text-muted-foreground">No rides yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <HealthRow icon={Server} label="Backend API" ok={health.data?.status === 'ok'} loading={health.isLoading} />
                <HealthRow icon={Database} label="MongoDB" ok={health.data?.db === 'connected'} loading={health.isLoading} />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Firebase RTDB / FCM health has no backend endpoint yet — see BACKEND_REQUIREMENTS.md.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recently Registered Drivers</CardTitle>
              <Link to="/drivers" className="text-xs font-semibold [color:hsl(var(--primary))] hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {snapshot.isLoading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : snapshot.data?.recentDrivers.length ? (
                <div className="divide-y divide-border">
                  {snapshot.data.recentDrivers.map((d) => (
                    <Link key={d._id} to={`/drivers/${d._id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/40">
                      <Avatar>
                        <AvatarFallback>{initialsOf(d.firstName, d.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {d.firstName} {d.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {titleCase(d.vehicleType)} · {d.vehiclePlate}
                        </p>
                      </div>
                      <DriverStatusBadge isVerified={d.isVerified} isOnline={d.isOnline} isSuspended={d.isSuspended} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm text-muted-foreground">No drivers registered yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function HealthRow({ icon: Icon, label, ok, loading }: { icon: typeof Server; label: string; ok?: boolean; loading: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-4 w-14" />
      ) : (
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? '[color:hsl(var(--success))]' : '[color:hsl(var(--destructive))]'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--destructive))]'}`} />
          {ok ? 'Operational' : 'Down'}
        </span>
      )}
    </div>
  );
}
