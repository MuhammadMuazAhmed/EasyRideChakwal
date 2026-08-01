import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, Wallet, TrendingUp, CheckCircle2, XCircle, Ban, RotateCcw, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryErrorState } from '@/components/common/EmptyState';
import { DriverStatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getDriver, setDriverVerification, type DriverVerifyAction } from '@/features/drivers/api';
import { formatPKR, initialsOf, titleCase } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['driver', id], queryFn: () => getDriver(id!), enabled: !!id });

  const verifyMutation = useMutation({
    mutationFn: (action: DriverVerifyAction) => setDriverVerification(id!, action),
    onSuccess: () => {
      toast.success('Driver updated');
      queryClient.invalidateQueries({ queryKey: ['driver', id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Action failed'),
  });

  if (query.isError) return <QueryErrorState error={query.error} onRetry={() => query.refetch()} />;

  const d = query.data;

  return (
    <div>
      <Link to="/drivers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Drivers
      </Link>

      {query.isLoading || !d ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <PageHeader
            title={`${d.firstName} ${d.lastName}`}
            description={d.phone}
            actions={
              <>
                {!d.isVerified && (
                  <>
                    <Button variant="outline" onClick={() => verifyMutation.mutate('reject')} loading={verifyMutation.isPending}>
                      <XCircle /> Reject
                    </Button>
                    <Button onClick={() => verifyMutation.mutate('approve')} loading={verifyMutation.isPending}>
                      <CheckCircle2 /> Approve
                    </Button>
                  </>
                )}
                {d.isVerified && !d.isSuspended && (
                  <Button variant="destructive" onClick={() => verifyMutation.mutate('suspend')} loading={verifyMutation.isPending}>
                    <Ban /> Suspend
                  </Button>
                )}
                {d.isSuspended && (
                  <Button onClick={() => verifyMutation.mutate('unsuspend')} loading={verifyMutation.isPending}>
                    <RotateCcw /> Unsuspend
                  </Button>
                )}
              </>
            }
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{initialsOf(d.firstName, d.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-bold">
                    {d.firstName} {d.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{d.phone}</p>
                </div>
                <DriverStatusBadge isVerified={d.isVerified} isOnline={d.isOnline} isSuspended={d.isSuspended} />
                {d.isSuspended && d.suspensionReason && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs [color:hsl(var(--destructive))]">{d.suspensionReason}</p>
                )}
                <Separator className="my-1" />
                <div className="grid w-full grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="flex items-center justify-center gap-1 text-lg font-bold">
                      <Star className="h-4 w-4 fill-primary [color:hsl(var(--primary))]" />
                      {d.rating?.toFixed(1)}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{d.totalTrips}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">Trips</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{new Date(d.createdAt).getFullYear()}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">Joined</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/12">
                      <TrendingUp className="h-5 w-5 [color:hsl(var(--success))]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">Total Earnings</p>
                      <p className="text-lg font-bold">{formatPKR(d.totalEarnings)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                      <Wallet className="h-5 w-5 [color:hsl(var(--primary))]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">Wallet Balance</p>
                      <p className="text-lg font-bold">{formatPKR(d.walletBalance)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Vehicle</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-3 sm:grid-cols-3">
                  <Field label="Type" value={titleCase(d.vehicleType)} />
                  <Field label="Model" value={d.vehicleModel} />
                  <Field label="Plate" value={d.vehiclePlate} />
                  <Field label="Color" value={d.vehicleColor} />
                  <Field label="Year" value={String(d.vehicleYear)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-3 sm:grid-cols-3">
                  <Field label="CNIC Number" value={d.cnicNumber} />
                  <Field label="License Number" value={d.licenseNumber} />
                  <Field label="License Expiry" value={new Date(d.licenseExpiry).toLocaleDateString('en-PK')} />
                </CardContent>
                <CardContent className="flex flex-wrap gap-3 pt-0">
                  <a href="https://id.nadra.gov.pk/e-verisys" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium [color:hsl(var(--primary))] hover:underline">
                    Verify CNIC (NADRA) <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://dlims.punjab.gov.pk" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium [color:hsl(var(--primary))] hover:underline">
                    Verify License (DLIMS) <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://mtmis.excise.punjab.gov.pk" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium [color:hsl(var(--primary))] hover:underline">
                    Verify Vehicle (MTMIS) <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
