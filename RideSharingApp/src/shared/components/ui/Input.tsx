import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/shared/theme';
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
  placeholderTextColor,
  ...props
}: InputProps) {
  const { theme } = useTheme();

  return (
    <View className={cn('mb-3', containerClassName)}>
      {label ? (
        <Text style={{ color: theme.textSecondary }} className="mb-1 text-[10px] font-bold uppercase tracking-wide">
          {label}
        </Text>
      ) : null}
      <TextInput
        style={{
          backgroundColor: theme.inputBg,
          borderColor: error ? '#EF4444' : theme.inputBorder,
          color: theme.inputText,
        }}
        className={cn(
          'rounded-lg border-[1.5px] px-3 py-2.5 text-sm',
          className,
        )}
        placeholderTextColor={placeholderTextColor ?? theme.placeholderText}
        {...props}
      />
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}

