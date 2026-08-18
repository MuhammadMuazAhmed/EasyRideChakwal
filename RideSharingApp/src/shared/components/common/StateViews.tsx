import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{ backgroundColor: theme.background }}
      className="flex-1 items-center justify-center p-6"
    >
      <ActivityIndicator size="large" color="#F5C400" />
      <Text style={{ color: theme.textSecondary }} className="mt-3 text-sm font-medium">
        {message}
      </Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{ backgroundColor: theme.background }}
      className="flex-1 items-center justify-center p-6"
    >
      <Text className="mb-3 text-4xl">{icon}</Text>
      <Text style={{ color: theme.textPrimary }} className="mb-1 text-base font-bold">
        {title}
      </Text>
      {description ? (
        <Text style={{ color: theme.textSecondary }} className="mb-4 text-center text-sm">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} className="min-w-[160px]" />
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{ backgroundColor: theme.background }}
      className="flex-1 items-center justify-center p-6"
    >
      <Text className="mb-2 text-4xl">⚠️</Text>
      <Text style={{ color: theme.textSecondary }} className="mb-4 text-center text-sm">
        {message}
      </Text>
      {onRetry ? <Button title="Try Again" onPress={onRetry} /> : null}
    </View>
  );
}
