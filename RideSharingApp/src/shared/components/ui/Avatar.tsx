import { Text, View } from 'react-native';

import { cn } from '@/shared/utils';

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
};

const textSizeStyles = {
  sm: 'text-[11px]',
  md: 'text-[13px]',
  lg: 'text-base',
  xl: 'text-lg',
};

export function Avatar({ initials, size = 'md', className }: AvatarProps) {
  return (
    <View
      className={cn(
        'items-center justify-center rounded-full bg-accent',
        sizeStyles[size],
        className,
      )}
    >
      <Text className={cn('font-black text-primary', textSizeStyles[size])}>{initials}</Text>
    </View>
  );
}
