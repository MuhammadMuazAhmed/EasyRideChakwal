import { Pressable, Text, View } from 'react-native';

import { cn, formatCurrency } from '@/shared/utils';
import type { VehicleType } from '@/shared/types';
import { vehicleOptions } from '@/shared/constants/mockData';

interface VehicleTypeSelectorProps {
  selected: VehicleType;
  onSelect: (type: VehicleType) => void;
}

export function VehicleTypeSelector({ selected, onSelect }: VehicleTypeSelectorProps) {
  return (
    <View className="mb-2.5 flex-row gap-2">
      {vehicleOptions.map((vehicle) => {
        const isSelected = selected === vehicle.type;
        return (
          <Pressable
            key={vehicle.type}
            onPress={() => onSelect(vehicle.type)}
            className={cn(
              'flex-1 items-center rounded-lg border-2 px-2 py-2',
              isSelected
                ? 'border-accent bg-accent-light'
                : 'border-transparent bg-surface-muted',
            )}
          >
            <Text className="mb-0.5 text-lg">{vehicle.icon}</Text>
            <Text
              className={cn(
                'text-[11px] font-semibold',
                isSelected ? 'text-[#7A5800]' : 'text-text-primary',
              )}
            >
              {vehicle.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface VehicleOptionCardProps {
  type: VehicleType;
  fare: number;
  eta: number;
  selected: boolean;
  onSelect: () => void;
}

export function VehicleOptionCard({
  type,
  fare,
  eta,
  selected,
  onSelect,
}: VehicleOptionCardProps) {
  const vehicle = vehicleOptions.find((v) => v.type === type);
  if (!vehicle) return null;

  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'mb-2 flex-row items-center gap-3 rounded-xl border-2 p-3',
        selected ? 'border-accent bg-accent-light' : 'border-border bg-white',
      )}
    >
      <Text className="text-2xl">{vehicle.icon}</Text>
      <View className="flex-1">
        <Text className="text-sm font-bold text-text-primary">{vehicle.label}</Text>
        <Text className="text-[11px] text-text-tertiary">{eta} min away</Text>
      </View>
      <Text className="text-sm font-extrabold text-text-primary">{formatCurrency(fare)}</Text>
    </Pressable>
  );
}

interface DriverInfoCardProps {
  name: string;
  initials: string;
  rating: number;
  totalTrips: number;
  vehicleModel: string;
  vehiclePlate: string;
  pickup?: string;
  destination?: string;
  eta?: string;
  progress?: number;
  showActions?: boolean;
  onCall?: () => void;
  onChat?: () => void;
  onSOS?: () => void;
}

export function DriverInfoCard({
  name,
  initials,
  rating,
  totalTrips,
  vehicleModel,
  vehiclePlate,
  pickup,
  destination,
  eta,
  progress,
  showActions = false,
  onCall,
  onChat,
  onSOS,
}: DriverInfoCardProps) {
  return (
    <View>
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-accent">
          <Text className="text-base font-black text-primary">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-text-primary">{name}</Text>
          <Text className="text-[11px] text-text-tertiary">
            {'★'.repeat(Math.round(rating))} {rating} · {totalTrips} trips
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[11px] text-text-secondary">{vehicleModel}</Text>
          <View className="mt-0.5 rounded-lg bg-primary px-2.5 py-1">
            <Text className="text-xs font-extrabold tracking-wider text-accent">{vehiclePlate}</Text>
          </View>
        </View>
      </View>

      {pickup && destination ? (
        <View className="mb-2.5 rounded-lg bg-surface-muted p-2.5">
          <View className="mb-1 flex-row justify-between">
            <Text className="text-[11px] text-text-tertiary">Pickup: {pickup}</Text>
            <Text className="text-[11px] text-text-tertiary">Drop: {destination}</Text>
          </View>
          {progress !== undefined ? (
            <View className="my-1.5 h-1.5 overflow-hidden rounded-full bg-[#F0F0F0]">
              <View className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
            </View>
          ) : null}
          {eta ? (
            <Text className="text-center text-[11px] text-text-tertiary">{eta}</Text>
          ) : null}
        </View>
      ) : null}

      {showActions ? (
        <View className="flex-row gap-2">
          <ActionButton icon="📞" label="Call" onPress={onCall} />
          <ActionButton icon="💬" label="Chat" onPress={onChat} />
          <ActionButton icon="🚨" label="SOS" variant="danger" onPress={onSOS} />
        </View>
      ) : null}
    </View>
  );
}

function ActionButton({
  icon,
  label,
  variant = 'default',
  onPress,
}: {
  icon: string;
  label: string;
  variant?: 'default' | 'danger';
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 items-center rounded-lg border py-2.5',
        variant === 'danger'
          ? 'border-red-300 bg-danger-light'
          : 'border-border bg-surface-muted',
      )}
    >
      <Text className="text-lg">{icon}</Text>
      <Text
        className={cn(
          'mt-1 text-[11px] font-bold',
          variant === 'danger' ? 'text-danger' : 'text-text-primary',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface RideHistoryCardProps {
  date: string;
  pickup: string;
  destination: string;
  fare: number;
  driverName: string;
  rating: number;
  onPress?: () => void;
  onRebook?: () => void;
}

export function RideHistoryCard({
  date,
  pickup,
  destination,
  fare,
  driverName,
  rating,
  onPress,
  onRebook,
}: RideHistoryCardProps) {
  return (
    <Pressable onPress={onPress} className="mb-2">
      <View className="rounded-xl border border-border bg-white p-3">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="text-[11px] text-text-tertiary">{date}</Text>
          <Text className="text-sm font-extrabold text-text-primary">{formatCurrency(fare)}</Text>
        </View>
        <View className="mb-1 flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-accent" />
          <Text className="text-xs text-text-primary">{pickup}</Text>
        </View>
        <View className="ml-[3px] h-2 border-l-2 border-dashed border-border" />
        <View className="mb-2 flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-success" />
          <Text className="text-xs text-text-primary">{destination}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] text-text-tertiary">{driverName}</Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-[11px] text-accent">★ {rating.toFixed(1)}</Text>
            {onRebook ? (
              <Pressable
                onPress={onRebook}
                className="rounded-lg bg-primary px-2.5 py-1 active:opacity-90"
              >
                <Text className="text-[11px] font-bold text-accent">Re-book</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, onRate, size = 32 }: StarRatingProps) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onRate(star)}>
          <Text style={{ fontSize: size, opacity: star <= rating ? 1 : 0.35 }}>
            {star <= rating ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

interface FeedbackTagProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FeedbackTag({ label, selected, onPress }: FeedbackTagProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-full border-[1.5px] px-2.5 py-1.5',
        selected ? 'border-accent bg-accent-light' : 'border-border bg-surface-muted',
      )}
    >
      <Text
        className={cn(
          'text-[11px] font-semibold',
          selected ? 'text-[#7A5800]' : 'text-text-secondary',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
