import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '@/shared/theme';
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
  const { theme } = useTheme();

  const content = (
    <View
      style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm',
        className,
      )}
    >
      <Ionicons name="search-outline" size={20} color={theme.placeholderText} />
      {editable ? (
        <Text
          style={{ color: theme.textPrimary }}
          className="flex-1 text-sm"
          onPress={() => onChangeText?.('')}
        >
        </Text>
      ) : (
        <Text
          style={{ color: value ? theme.textPrimary : theme.placeholderText }}
          className="flex-1 text-sm"
        >
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
  const { theme } = useTheme();
  const dotClass = dotColor === 'green' ? 'bg-success' : 'bg-accent';

  const content = (
    <View
      style={
        highlighted
          ? { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }
          : { backgroundColor: theme.surface, borderColor: theme.border }
      }
      className="mb-1.5 flex-row items-center gap-2 rounded-xl border-[1.5px] px-3 py-2.5"
    >
      <View className={cn('h-2 w-2 rounded-full', dotClass)} />
      <View className="flex-1">
        <Text style={{ color: theme.textPrimary }} className="text-sm font-semibold">{label}</Text>
        {sublabel ? <Text style={{ color: theme.textSecondary }} className="text-xs">{sublabel}</Text> : null}
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

export function PlaceListItem({ name, subtitle, onPress }: PlaceListItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{ borderBottomColor: theme.divider }}
      className="flex-row items-center gap-2.5 border-b py-2.5 active:opacity-80"
    >
      <View style={{ backgroundColor: theme.surface }} className="h-8 w-8 items-center justify-center rounded-lg">
        <Text className="text-sm">📍</Text>
      </View>
      <View className="flex-1">
        <Text style={{ color: theme.textPrimary }} className="text-sm font-semibold">{name}</Text>
        {subtitle ? <Text style={{ color: theme.textSecondary }} className="text-[10px]">{subtitle}</Text> : null}
      </View>
      <Text style={{ color: theme.textMuted }}>›</Text>
    </Pressable>
  );
}

interface BottomSheetHandleProps {
  className?: string;
}

export function BottomSheetHandle({ className }: BottomSheetHandleProps) {
  const { theme } = useTheme();

  return (
    <View className={cn('items-center py-2', className)}>
      <View style={{ backgroundColor: theme.border }} className="h-1 w-10 rounded-full" />
    </View>
  );
}

interface MapBottomSheetProps {
  children: React.ReactNode;
  className?: string;
}

export function MapBottomSheet({ children, className }: MapBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme.card, paddingBottom: insets.bottom + 8 },
      ]}
      className={cn(
        'absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-lg',
        className,
      )}
    >
      <BottomSheetHandle />
      <View className="px-3">{children}</View>
    </View>
  );
}

