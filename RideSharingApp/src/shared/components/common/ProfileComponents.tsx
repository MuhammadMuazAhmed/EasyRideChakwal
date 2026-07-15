import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/shared/components/ui/Avatar';
import { StatCard } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';

interface ProfileHeaderProps {
  initials: string;
  name: string;
  phone: string;
  badge?: string;
}

export function ProfileHeader({ initials, name, phone, badge }: ProfileHeaderProps) {
  return (
    <View className="flex-row items-center gap-3.5 bg-primary px-4 py-5">
      <Avatar initials={initials} size="xl" />
      <View>
        <Text className="text-[15px] font-bold text-white">{name}</Text>
        <Text className="text-xs text-[#AAAAAA]">{phone}</Text>
        {badge ? (
          <View className="mt-1 self-start">
            <Badge label={badge} variant="yellow" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

interface ProfileStatsProps {
  totalRides: number;
  rating: number;
}

export function ProfileStats({ totalRides, rating }: ProfileStatsProps) {
  return (
    <View className="flex-row gap-2 bg-surface-muted p-2.5">
      <StatCard value={String(totalRides)} label="Total Rides" />
      <StatCard value={`${rating}★`} label="Your Rating" valueClassName="text-accent" />
    </View>
  );
}

interface ProfileMenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export function ProfileMenuItem({
  icon,
  label,
  value,
  onPress,
  destructive = false,
}: ProfileMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2.5 border-b border-surface-muted px-1 py-3 active:bg-surface-muted"
    >
      <Text className="text-lg">{icon}</Text>
      <Text
        className={`flex-1 text-sm font-semibold ${destructive ? 'text-danger' : 'text-text-primary'}`}
      >
        {label}
      </Text>
      {value ? <Text className="text-xs text-text-tertiary">{value}</Text> : null}
      <Text className="text-text-tertiary">›</Text>
    </Pressable>
  );
}

interface OtpInputProps {
  value: string;
  length?: number;
}

export function OtpInputDisplay({ value, length = 4 }: OtpInputProps) {
  const digits = value.split('').slice(0, length);
  const emptySlots = length - digits.length;

  return (
    <View className="flex-row justify-center gap-2.5">
      {digits.map((digit, index) => (
        <View
          key={`digit-${index}`}
          className="h-12 w-11 items-center justify-center rounded-xl border-2 border-accent bg-accent-light"
        >
          <Text className="text-2xl font-extrabold text-text-primary">{digit}</Text>
        </View>
      ))}
      {Array.from({ length: emptySlots }).map((_, index) => (
        <View
          key={`empty-${index}`}
          className="h-12 w-11 items-center justify-center rounded-xl border-2 border-border bg-surface-muted"
        >
          {index === 0 && emptySlots === length - digits.length ? (
            <View className="h-6 w-0.5 rounded-full bg-primary" />
          ) : null}
        </View>
      ))}
    </View>
  );
}

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'ride' | 'promo' | 'system' | 'safety';
  onPress?: () => void;
}

const typeIcons = {
  ride: '🚗',
  promo: '🎁',
  system: 'ℹ️',
  safety: '🛡️',
};

export function NotificationItem({
  title,
  message,
  time,
  read,
  type,
  onPress,
}: NotificationItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2 flex-row gap-3 rounded-xl border p-3 ${read ? 'border-border bg-white' : 'border-accent bg-accent-light'}`}
    >
      <Text className="text-xl">{typeIcons[type]}</Text>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-text-primary">{title}</Text>
          {!read ? <View className="h-2 w-2 rounded-full bg-accent" /> : null}
        </View>
        <Text className="mt-0.5 text-xs text-text-secondary">{message}</Text>
        <Text className="mt-1 text-[10px] text-text-tertiary">{time}</Text>
      </View>
    </Pressable>
  );
}
