import { Badge } from '@/components/ui/badge';
import { titleCase } from '@/lib/utils';
import type { RideStatus } from '@/types';

const RIDE_STATUS_VARIANT: Record<RideStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  searching: 'primary',
  driver_assigned: 'primary',
  driver_en_route: 'warning',
  driver_arrived: 'warning',
  in_progress: 'success',
  completed: 'success',
  cancelled: 'destructive',
  no_driver: 'outline',
};

export function RideStatusBadge({ status }: { status: RideStatus }) {
  return (
    <Badge variant={RIDE_STATUS_VARIANT[status] ?? 'default'} dot>
      {titleCase(status)}
    </Badge>
  );
}

export function DriverStatusBadge({
  isVerified,
  isOnline,
  isSuspended,
}: {
  isVerified: boolean;
  isOnline: boolean;
  isSuspended: boolean;
}) {
  if (isSuspended) {
    return (
      <Badge variant="destructive" dot>
        Suspended
      </Badge>
    );
  }
  if (!isVerified) {
    return (
      <Badge variant="warning" dot>
        Pending
      </Badge>
    );
  }
  if (isOnline) {
    return (
      <Badge variant="success" dot>
        Online
      </Badge>
    );
  }
  return (
    <Badge variant="outline" dot>
      Offline
    </Badge>
  );
}
