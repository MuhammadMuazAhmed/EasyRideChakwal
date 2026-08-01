import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Wallet, MapPin, Phone, Mail } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryErrorState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getRider } from '@/features/riders/api';
import { formatPKR, initialsOf } from '@/lib/utils';

export function RiderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: ['rider', id], queryFn: () => getRider(id!), enabled: !!id });

  if (query.isError) return <QueryErrorState error={query.error} onRetry={() => query.refetch()} />;

  const r = query.data;

  return (
    <div>
      <Link to="/riders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Riders
      </Link>

      {query.isLoading || !r ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <PageHeader title={`${r.firstName} ${r.lastName}`} description={r.phone} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{initialsOf(r.firstName, r.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-bold">
                    {r.firstName} {r.lastName}
                  </p>
                  <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {r.phone}
                  </p>
                  {r.email && (
                    <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {r.email}
                    </p>
                  )}
                </div>
                <Separator className="my-1" />
                <div className="grid w-full grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="flex items-center justify-center gap-1 text-lg font-bold">
                      <Star className="h-4 w-4 fill-primary [color:hsl(var(--primary))]" />
                      {r.rating?.toFixed(1)}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{r.totalRides}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">Total Rides</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 lg:col-span-2">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                    <Wallet className="h-5 w-5 [color:hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground">Wallet Balance</p>
                    <p className="text-lg font-bold">{formatPKR(r.walletBalance)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Places</CardTitle>
                </CardHeader>
                <CardContent>
                  {r.savedPlaces.length ? (
                    <div className="flex flex-col gap-2">
                      {r.savedPlaces.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{p.label}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No saved places.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  {r.emergencyContacts.length ? (
                    <div className="flex flex-col gap-2">
                      {r.emergencyContacts.map((c, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.relationship}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{c.phone}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No emergency contacts on file.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
