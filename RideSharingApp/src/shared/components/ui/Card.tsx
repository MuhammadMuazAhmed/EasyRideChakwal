import { Pressable, Text, View, type ViewProps } from 'react-native';

import { useTheme } from '@/shared/theme';
import { cn } from '@/shared/utils';

interface CardProps extends ViewProps {
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className, ...props }: CardProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
      className={cn('rounded-xl border p-3', className)}
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
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }} className="flex-1 items-center rounded-lg border p-2.5">
      <Text style={{ color: theme.textPrimary }} className={cn('text-xl font-extrabold', valueClassName)}>{value}</Text>
      <Text style={{ color: theme.textMuted }} className="mt-0.5 text-[9px] font-semibold uppercase">{label}</Text>
    </View>
  );
}

