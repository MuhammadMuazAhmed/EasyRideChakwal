import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { QueryErrorState, EmptyState } from '@/components/common/EmptyState';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { listRiders } from '@/features/riders/api';
import { formatPKR, initialsOf } from '@/lib/utils';

const LIMIT = 20;

export function RidersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1);
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['riders', { page, search }],
    queryFn: () => listRiders({ page, limit: LIMIT, search: search || undefined }),
  });

  function setPage(next: number) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('page', String(next));
      return p;
    });
  }

  return (
    <div>
      <PageHeader title="Riders" description="Manage rider accounts, trip history, and wallets." />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{query.data ? `${query.data.total} riders` : ' '}</p>
          <SearchInput placeholder="Search name, phone…" value={search} onChange={setSearch} />
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
        ) : !query.data?.riders?.length ? (
          <div className="p-4">
            <EmptyState title="No riders found" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rider</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Total Rides</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Referral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.riders.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>
                      <Link to={`/riders/${r._id}`} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initialsOf(r.firstName, r.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{r.phone}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="h-3.5 w-3.5 fill-primary [color:hsl(var(--primary))]" />
                        {r.rating?.toFixed(1) ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>{r.totalRides}</TableCell>
                    <TableCell>{formatPKR(r.walletBalance)}</TableCell>
                    <TableCell className="font-mono text-xs">{r.referralCode}</TableCell>
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
