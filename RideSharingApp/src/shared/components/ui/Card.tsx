import { Pressable, Text, View, type ViewProps } from 'react-native';

import { cn } from '@/shared/utils';

interface CardProps extends ViewProps {
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className, ...props }: CardProps) {
  const content = (
    <View
      className={cn('rounded-xl border border-border bg-white p-3', className)}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-90">
        {content}
      </Pressable>
    );
  }

  return content;
}

interface StatCardProps {
  value: string;
  label: string;
  valueClassName?: string;
}

export function StatCard({ value, label, valueClassName }: StatCardProps) {
  return (
    <View className="flex-1 items-center rounded-lg border border-border bg-white p-2.5">
      <Text className={cn('text-xl font-extrabold text-primary', valueClassName)}>{value}</Text>
      <Text className="mt-0.5 text-[9px] font-semibold uppercase text-text-tertiary">{label}</Text>
    </View>
  );
}
