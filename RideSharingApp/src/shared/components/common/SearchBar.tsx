import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/utils';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  className?: string;
}

export function SearchBar({
  placeholder = 'Kahan jaana hai? (Where to go?)',
  value,
  onPress,
  onChangeText,
  editable = false,
  className,
}: SearchBarProps) {
  const content = (
    <View
      className={cn(
        'flex-row items-center gap-2 rounded-xl border-[1.5px] border-border bg-surface-muted px-3.5 py-2.5',
        className,
      )}
    >
      <Text className="text-base text-text-tertiary">🔍</Text>
      {editable ? (
        <Text
          className="flex-1 text-sm text-text-primary"
          onPress={() => onChangeText?.('')}
        >
          {/* Using native TextInput would be better but keeping Pressable wrapper for navigation */}
        </Text>
      ) : (
        <Text className={cn('flex-1 text-sm', value ? 'text-text-primary' : 'text-text-tertiary')}>
          {value || placeholder}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

interface LocationRowProps {
  label: string;
  sublabel?: string;
  dotColor?: 'yellow' | 'green';
  highlighted?: boolean;
  onPress?: () => void;
}

export function LocationRow({
  label,
  sublabel,
  dotColor = 'yellow',
  highlighted = false,
  onPress,
}: LocationRowProps) {
  const dotClass = dotColor === 'green' ? 'bg-success' : 'bg-accent';

  const content = (
    <View
      className={cn(
        'mb-1.5 flex-row items-center gap-2 rounded-xl px-3 py-2.5',
        highlighted ? 'border-2 border-accent bg-accent-light' : 'border-[1.5px] border-border bg-surface-muted',
      )}
    >
      <View className={cn('h-2 w-2 rounded-full', dotClass)} />
      <View className="flex-1">
        <Text className="text-sm text-text-secondary">{label}</Text>
        {sublabel ? <Text className="text-xs text-text-tertiary">{sublabel}</Text> : null}
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

interface PlaceListItemProps {
  name: string;
  subtitle?: string;
  onPress?: () => void;
}

export function PlaceListItem({ name, subtitle = 'Chakwal, Punjab', onPress }: PlaceListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2.5 border-b border-surface-muted py-2.5 active:bg-surface-muted"
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-surface-muted">
        <Text className="text-sm">📍</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-text-primary">{name}</Text>
        <Text className="text-[10px] text-text-tertiary">{subtitle}</Text>
      </View>
      <Text className="text-text-tertiary">›</Text>
    </Pressable>
  );
}

interface BottomSheetHandleProps {
  className?: string;
}

export function BottomSheetHandle({ className }: BottomSheetHandleProps) {
  return (
    <View className={cn('items-center py-2', className)}>
      <View className="h-1 w-10 rounded-full bg-border" />
    </View>
  );
}

interface MapBottomSheetProps {
  children: React.ReactNode;
  className?: string;
}

export function MapBottomSheet({ children, className }: MapBottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        'absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-lg',
        className,
      )}
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      <BottomSheetHandle />
      <View className="px-3">{children}</View>
    </View>
  );
}
