import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Star, CheckCircle2, XCircle, Ban, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterChips } from '@/components/common/FilterChips';
import { Pagination } from '@/components/common/Pagination';
import { QueryErrorState, EmptyState } from '@/components/common/EmptyState';
import { DriverStatusBadge } from '@/components/common/StatusBadge';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { listDrivers, setDriverVerification, type DriverVerifyAction } from '@/features/drivers/api';
import { initialsOf, titleCase } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';
import type { DriverStatusFilter } from '@/types';

const STATUS_OPTIONS: { value: DriverStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'online', label: 'Online' },
  { value: 'suspended', label: 'Suspended' },
];

const LIMIT = 20;

export function DriversPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as DriverStatusFilter) ?? 'all';
  const page = Number(searchParams.get('page') ?? 1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['drivers', { status, page, search }],
    queryFn: () => listDrivers({ status, page, limit: LIMIT, search: search || undefined }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: DriverVerifyAction }) => setDriverVerification(id, action),
    onSuccess: (_data, vars) => {
      toast.success(`Driver ${vars.action === 'approve' ? 'approved' : vars.action === 'reject' ? 'rejected' : vars.action === 'suspend' ? 'suspended' : 'unsuspended'}`);
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Action failed'),
  });

  function setStatus(next: DriverStatusFilter) {
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
      <PageHeader title="Drivers" description="Manage driver accounts, verification, and status." />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          <SearchInput placeholder="Search name, phone, plate…" value={search} onChange={setSearch} />
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
        ) : !query.data?.drivers?.length ? (
          <div className="p-4">
            <EmptyState title="No drivers found" description="Try a different search or status filter." />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Trips</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.drivers.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell>
                      <Link to={`/drivers/${d._id}`} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initialsOf(d.firstName, d.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {d.firstName} {d.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{d.phone}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{titleCase(d.vehicleType)}</p>
                      <p className="text-xs text-muted-foreground">{d.vehiclePlate}</p>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="h-3.5 w-3.5 fill-primary [color:hsl(var(--primary))]" />
                        {d.rating?.toFixed(1) ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>{d.totalTrips}</TableCell>
                    <TableCell>
                      <DriverStatusBadge isVerified={d.isVerified} isOnline={d.isOnline} isSuspended={d.isSuspended} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/drivers/${d._id}`}>View details</Link>
                          </DropdownMenuItem>
                          {!d.isVerified && (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: d._id, action: 'approve' })}>
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {!d.isVerified && (
                            <DropdownMenuItem destructive onClick={() => verifyMutation.mutate({ id: d._id, action: 'reject' })}>
                              <XCircle className="h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          )}
                          {d.isVerified && !d.isSuspended && (
                            <DropdownMenuItem destructive onClick={() => verifyMutation.mutate({ id: d._id, action: 'suspend' })}>
                              <Ban className="h-4 w-4" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {d.isSuspended && (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: d._id, action: 'unsuspend' })}>
                              <RotateCcw className="h-4 w-4" /> Unsuspend
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
