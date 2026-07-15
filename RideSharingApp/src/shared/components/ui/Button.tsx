import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

import { cn } from '@/shared/utils';

type ButtonVariant = 'primary' | 'yellow' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:opacity-90',
  yellow: 'bg-accent active:opacity-90',
  outline: 'bg-surface-muted border border-border active:bg-accent-light',
  danger: 'bg-danger active:opacity-90',
  ghost: 'bg-transparent active:bg-surface-muted',
};

const textVariantStyles: Record<ButtonVariant, string> = {
  primary: 'text-accent',
  yellow: 'text-primary',
  outline: 'text-text-primary',
  danger: 'text-white',
  ghost: 'text-text-primary',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-2 px-3 rounded-lg',
  md: 'py-3 px-4 rounded-xl',
  lg: 'py-3.5 px-5 rounded-xl',
};

const textSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        'items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50',
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#F5C400' : '#111111'} />
      ) : (
        <Text
          className={cn(
            'font-bold tracking-wide',
            textVariantStyles[variant],
            textSizeStyles[size],
            textClassName,
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
