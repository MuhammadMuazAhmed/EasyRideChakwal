import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/shared/components/ui/Button';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-surface-background p-6">
      <ActivityIndicator size="large" color="#F5C400" />
      <Text className="mt-3 text-sm text-text-secondary">{message}</Text>
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
  return (
    <View className="flex-1 items-center justify-center bg-surface-background p-6">
      <Text className="mb-3 text-4xl">{icon}</Text>
      <Text className="mb-1 text-base font-bold text-text-primary">{title}</Text>
      {description ? (
        <Text className="mb-4 text-center text-sm text-text-secondary">{description}</Text>
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
  return (
    <View className="flex-1 items-center justify-center bg-surface-background p-6">
      <Text className="mb-2 text-4xl">⚠️</Text>
      <Text className="mb-4 text-center text-sm text-text-secondary">{message}</Text>
      {onRetry ? <Button title="Try Again" onPress={onRetry} /> : null}
    </View>
  );
}
