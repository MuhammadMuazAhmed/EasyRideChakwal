import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Flag, Ban, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryErrorState } from '@/components/common/EmptyState';
import { RideStatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRide, forceCancelRide } from '@/features/rides/api';
import { formatPKR, titleCase } from '@/lib/utils';
import { isRidePartyRef } from '@/lib/type-guards';
import { ApiError } from '@/lib/api-client';

export function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');

  const query = useQuery({ queryKey: ['ride', id], queryFn: () => getRide(id!), enabled: !!id });

  const cancelMutation = useMutation({
    mutationFn: () => forceCancelRide(id!, reason),
    onSuccess: () => {
      toast.success('Ride force-cancelled');
      setCancelOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ride', id] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        toast.error('Backend rejected this — admin force-cancel needs a backend change. See BACKEND_REQUIREMENTS.md.', { duration: 6000 });
        return;
      }
      toast.error(error instanceof ApiError ? error.message : 'Failed to cancel');
    },
  });

  if (query.isError) return <QueryErrorState error={query.error} onRetry={() => query.refetch()} />;

  const ride = query.data;
  const canCancel = ride && !['completed', 'cancelled'].includes(ride.status);

  return (
    <div>
      <Link to="/rides" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Trips
      </Link>

      {query.isLoading || !ride ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <PageHeader
            title={`${ride.pickup.name} → ${ride.destination.name}`}
            description={`#${ride._id.slice(-8).toUpperCase()}`}
            actions={
              canCancel && (
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                  <Ban /> Force Cancel
                </Button>
              )
            }
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Route</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 [color:hsl(var(--success))]" />
                    <div>
                      <p className="text-sm font-medium">{ride.pickup.name}</p>
                      <p className="text-xs text-muted-foreground">{ride.pickup.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Flag className="mt-0.5 h-4 w-4 shrink-0 [color:hsl(var(--destructive))]" />
                    <div>
                      <p className="text-sm font-medium">{ride.destination.name}</p>
                      <p className="text-xs text-muted-foreground">{ride.destination.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-3 sm:grid-cols-3">
                  <Field label="Status" value={<RideStatusBadge status={ride.status} />} />
                  <Field label="Vehicle" value={titleCase(ride.vehicleType)} />
                  <Field label="Payment" value={titleCase(ride.paymentMethod)} />
                  <Field label="Distance" value={`${ride.distance} km`} />
                  <Field label="Duration" value={`${ride.duration} min`} />
                  <Field label="Surge" value={`${ride.surgeMultiplier}x`} />
                  <Field label="Estimated Fare" value={formatPKR(ride.estimatedFare)} />
                  <Field label="Final Fare" value={formatPKR(ride.fare)} />
                  <Field label="Paid" value={ride.isPaid ? 'Yes' : 'No'} />
                </CardContent>
              </Card>

              {ride.cancelledBy && (
                <Card>
                  <CardContent className="flex items-start gap-3 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 [color:hsl(var(--warning))]" />
                    <div>
                      <p className="text-sm font-medium">Cancelled by {ride.cancelledBy}</p>
                      {ride.cancellationReason && <p className="text-xs text-muted-foreground">{ride.cancellationReason}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rider</CardTitle>
                </CardHeader>
                <CardContent>
                  {isRidePartyRef(ride.riderId) ? (
                    <Link to={`/riders/${ride.riderId._id}`} className="text-sm font-medium [color:hsl(var(--primary))] hover:underline">
                      {ride.riderId.firstName} {ride.riderId.lastName}
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not populated</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Driver</CardTitle>
                </CardHeader>
                <CardContent>
                  {isRidePartyRef(ride.driverId) ? (
                    <>
                      <Link to={`/drivers/${ride.driverId._id}`} className="text-sm font-medium [color:hsl(var(--primary))] hover:underline">
                        {ride.driverId.firstName} {ride.driverId.lastName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {ride.driverId.vehicleModel} · {ride.driverId.vehiclePlate}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No driver assigned yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force cancel this ride?</DialogTitle>
            <DialogDescription>This immediately ends the trip for both rider and driver. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Safety concern reported" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Never mind
            </Button>
            <Button variant="destructive" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
              Force Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
