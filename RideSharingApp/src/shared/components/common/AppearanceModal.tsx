import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import type { ThemePreference } from '@/store/themeStore';

interface AppearanceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AppearanceModal({ visible, onClose }: AppearanceModalProps) {
  const { theme, preference, setPreference } = useTheme();

  const options: { id: ThemePreference; label: string; icon: string; desc: string }[] = [
    { id: 'light', label: 'Light', icon: '☀️', desc: 'Always use light theme' },
    { id: 'dark', label: 'Dark', icon: '🌙', desc: 'Always use dark theme' },
    { id: 'default', label: 'Default', icon: '⚙️', desc: 'Follow device appearance' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        className="flex-1 justify-end"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          className="rounded-t-3xl border-t p-5 pb-8 shadow-xl"
        >
          {/* Handle bar */}
          <View className="items-center pb-4">
            <View style={{ backgroundColor: theme.border }} className="h-1 w-10 rounded-full" />
          </View>

          {/* Title */}
          <Text style={{ color: theme.textPrimary }} className="text-lg font-bold mb-1">
            Choose Appearance
          </Text>
          <Text style={{ color: theme.textSecondary }} className="text-xs mb-4">
            Select your preferred visual theme
          </Text>

          {/* Options */}
          <View className="gap-2.5">
            {options.map((option) => {
              const selected = preference === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setPreference(option.id);
                    onClose();
                  }}
                  style={{
                    backgroundColor: selected ? theme.accentLight : theme.surface,
                    borderColor: selected ? '#F5C400' : theme.cardBorder,
                  }}
                  className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] p-4 active:opacity-90"
                >
                  <Text className="text-xl">{option.icon}</Text>
                  <View className="flex-1">
                    <Text style={{ color: theme.textPrimary }} className="text-sm font-bold">
                      {option.label}
                    </Text>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                      {option.desc}
                    </Text>
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color="#F5C400" />
                  ) : (
                    <View style={{ borderColor: theme.textMuted }} className="h-5 w-5 rounded-full border-2" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
