import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterChips } from '@/components/common/FilterChips';
import { Pagination } from '@/components/common/Pagination';
import { QueryErrorState, EmptyState } from '@/components/common/EmptyState';
import { RideStatusBadge } from '@/components/common/StatusBadge';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { listRides } from '@/features/rides/api';
import { formatPKR } from '@/lib/utils';
import { isRidePartyRef } from '@/lib/type-guards';
import type { RideStatusFilter } from '@/types';

const STATUS_OPTIONS: { value: RideStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'searching', label: 'Searching' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_driver', label: 'No Driver' },
];

const LIMIT = 20;

export function RidesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as RideStatusFilter) ?? 'all';
  const page = Number(searchParams.get('page') ?? 1);

  const query = useQuery({
    queryKey: ['rides', { status, page }],
    queryFn: () => listRides({ status, page, limit: LIMIT }),
  });

  function setStatus(next: RideStatusFilter) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('status', next);
      p.set('page', '1');
      return p;
    });
  }

  function setPage(next: number) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('page', String(next));
      return p;
    });
  }

  return (
    <div>
      <PageHeader title="Trips" description="All rides across the platform." />

      <Card>
        <div className="border-b border-border p-4">
          <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </div>

        {query.isError ? (
          <div className="p-4">
            <QueryErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : query.isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !query.data?.rides?.length ? (
          <div className="p-4">
            <EmptyState title="No trips found" description="Try a different status filter." />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ride</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.rides.map((ride) => (
                  <TableRow key={ride._id}>
                    <TableCell>
                      <Link to={`/rides/${ride._id}`} className="block max-w-[220px]">
                        <p className="truncate text-sm font-medium">
                          {ride.pickup.name} → {ride.destination.name}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">#{ride._id.slice(-6).toUpperCase()}</p>
                      </Link>
                    </TableCell>
                    <TableCell>{isRidePartyRef(ride.riderId) ? `${ride.riderId.firstName} ${ride.riderId.lastName}` : '—'}</TableCell>
                    <TableCell>
                      {isRidePartyRef(ride.driverId) ? (
                        <>
                          <p>{`${ride.driverId.firstName} ${ride.driverId.lastName}`}</p>
                          <p className="text-xs text-muted-foreground">{ride.driverId.vehiclePlate}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{formatPKR(ride.fare || ride.estimatedFare)}</TableCell>
                    <TableCell>
                      <RideStatusBadge status={ride.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(ride.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} limit={LIMIT} total={query.data.total} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
