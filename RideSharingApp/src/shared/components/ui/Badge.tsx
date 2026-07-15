import { Text, View } from 'react-native';

import { cn } from '@/shared/utils';

type BadgeVariant = 'default' | 'green' | 'yellow' | 'red' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  green: 'bg-success-light',
  yellow: 'bg-accent-light',
  red: 'bg-danger-light',
  gray: 'bg-surface-muted',
};

const textVariantStyles: Record<BadgeVariant, string> = {
  default: 'text-accent',
  green: 'text-success',
  yellow: 'text-[#7A5800]',
  red: 'text-danger',
  gray: 'text-text-secondary',
};

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <View className={cn('rounded-full px-2 py-0.5', variantStyles[variant], className)}>
      <Text className={cn('text-[10px] font-bold', textVariantStyles[variant])}>{label}</Text>
    </View>
  );
}
