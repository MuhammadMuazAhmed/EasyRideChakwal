import type { LucideIcon } from 'lucide-react';
import { Construction, Inbox, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button size="sm" variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Renders the right empty/error state for a query automatically:
 * - 404 → "backend endpoint not built yet" (expected, documented gap)
 * - network error → "can't reach backend"
 * - anything else → generic error with retry
 */
export function QueryErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (error instanceof ApiError && error.isMissingEndpoint) {
    return (
      <EmptyState
        icon={Construction}
        title="This feature is waiting on a backend endpoint"
        description="The UI is fully wired and will populate automatically once the required API route ships. See BACKEND_REQUIREMENTS.md."
      />
    );
  }
  if (error instanceof ApiError && error.isNetworkError) {
    return (
      <EmptyState
        icon={WifiOff}
        title="Can't reach the EasyRide backend"
        description="Check VITE_API_BASE_URL and that the backend is running."
        action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
      />
    );
  }
  return (
    <EmptyState
      title="Couldn't load this data"
      description={error instanceof Error ? error.message : 'An unexpected error occurred.'}
      action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
    />
  );
}
