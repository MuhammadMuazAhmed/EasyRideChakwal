import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/shared/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName,
  className,
  ...props
}: InputProps) {
  return (
    <View className={cn('mb-3', containerClassName)}>
      {label ? (
        <Text className="mb-1 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={cn(
          'rounded-lg border-[1.5px] border-border bg-surface-muted px-3 py-2.5 text-sm text-text-primary',
          error && 'border-danger',
          className,
        )}
        placeholderTextColor="#888888"
        {...props}
      />
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}
