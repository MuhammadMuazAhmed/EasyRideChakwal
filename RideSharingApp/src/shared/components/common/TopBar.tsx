import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';
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
  const { theme } = useTheme();

  const bgStyle =
    variant === 'danger'
      ? { backgroundColor: '#DC2626' }
      : { backgroundColor: theme.headerBg, borderBottomWidth: 1, borderBottomColor: theme.border };

  return (
    <View
      className="flex-row items-center justify-between px-3.5 pb-2.5"
      style={[{ paddingTop: insets.top + 8 }, bgStyle]}
    >
      <View className="min-w-[40px] flex-row items-center gap-2">
        {leftAction}
        {showLogo ? (
          <View className="flex-row items-center gap-3">
            <Image
              source={require('@/assets/images/logo.jpeg')}
              style={{ width: 44, height: 44, borderRadius: 8 }}
              resizeMode="cover"
            />
            <View>
              {title ? (
                <Text style={{ color: theme.headerText }} className="text-[19px] font-semibold">
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text style={{ color: theme.headerSubtitle }} className="text-[13px] mt-0.5">
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        ) : title ? (
          <Text style={{ color: theme.headerText }} className="text-[15px] font-bold tracking-wide">
            {title}
          </Text>
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

export function BackButton({ onPress, color }: BackButtonProps) {
  const { theme } = useTheme();
  const arrowColor = color ?? theme.headerText;

  return (
    <Pressable onPress={onPress} hitSlop={8} className="p-1">
      <Text style={{ color: arrowColor, fontSize: 18 }}>←</Text>
    </Pressable>
  );
}

interface ScreenContainerProps {
  children?: React.ReactNode;
  className?: string;
  edges?: boolean;
}

export function ScreenContainer({ children, className }: ScreenContainerProps) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }} className={className}>
      {children}
    </View>
  );
}

