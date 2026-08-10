import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/utils';

interface TopBarProps {
  title?: string;
  showLogo?: boolean;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'danger' | 'light';
}

export function TopBar({
  title,
  showLogo = false,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default',
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-3.5 pb-2.5',
        variant === 'danger' ? 'bg-danger' : variant === 'light' ? 'bg-white' : 'bg-primary',
      )}
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="min-w-[40px] flex-row items-center gap-2">
        {leftAction}
        {showLogo ? (
          <View className="flex-row items-center gap-3">
            <Image
              source={require('@/assets/images/logo.jpeg')}
              style={{ width: 50, height: 50, borderRadius: 8 }}
              resizeMode="cover"
            />
            <View>
              {title ? (
                <Text className={cn('text-[19px] font-semibold', variant === 'light' ? 'text-neutral-900' : 'text-white')}>{title}</Text>
              ) : null}
              {subtitle ? (
                <Text className={cn('text-[13px] text-neutral-500 mt-0.5')}>{subtitle}</Text>
              ) : null}
            </View>
          </View>
        ) : title ? (
          <Text className={cn('text-[13px] font-bold tracking-wide', variant === 'light' ? 'text-neutral-900' : 'text-white')}>{title}</Text>
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
