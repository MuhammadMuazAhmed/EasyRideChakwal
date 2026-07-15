import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/utils';

interface TopBarProps {
  title?: string;
  showLogo?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'danger';
}

export function TopBar({
  title,
  showLogo = false,
  leftAction,
  rightAction,
  variant = 'default',
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-3.5 pb-2.5',
        variant === 'danger' ? 'bg-danger' : 'bg-primary',
      )}
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="min-w-[40px] flex-row items-center gap-2">
        {leftAction}
        {showLogo ? (
          <View className="flex-row items-center gap-1.5">
            <View className="rounded-md bg-accent px-1.5 py-0.5">
              <Text className="text-[11px] font-black text-primary">E</Text>
            </View>
            {title ? (
              <Text className="text-[13px] font-bold tracking-wide text-white">{title}</Text>
            ) : null}
          </View>
        ) : title ? (
          <Text className="text-[13px] font-bold tracking-wide text-white">{title}</Text>
        ) : null}
      </View>
      <View className="min-w-[40px] items-end">{rightAction}</View>
    </View>
  );
}

interface BackButtonProps {
  onPress: () => void;
  color?: string;
}

export function BackButton({ onPress, color = '#AAAAAA' }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} className="p-1">
      <Text style={{ color, fontSize: 18 }}>←</Text>
    </Pressable>
  );
}

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  edges?: boolean;
}

export function ScreenContainer({ children, className }: ScreenContainerProps) {
  return <View className={cn('flex-1 bg-surface-background', className)}>{children}</View>;
}
