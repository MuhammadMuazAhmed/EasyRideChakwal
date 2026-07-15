import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/shared/components/common/TopBar';
import { brand } from '@/shared/theme';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Maintenance'>;

const TOTAL_SECONDS = 45 * 60; // 45 minutes

const timelineSteps = [
  { label: 'Servers stopped', done: true },
  { label: 'Data backup in progress', done: true },
  { label: 'System upgrade running', done: false, active: true },
  { label: 'Testing & validation', done: false },
  { label: 'Services restored', done: false },
];

function useCountdown(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function MaintenanceScreen() {
  useNavigation<NavigationProp>();
  const countdown = useCountdown(TOTAL_SECONDS);

  // Pulsing gear animation
  const [pulse] = useState(() => new Animated.Value(1));
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const openWhatsApp = () => {
    void Linking.openURL(`https://wa.me/92${brand.supportPhone.replace(/\D/g, '').slice(1)}`);
  };

  return (
    <ScreenContainer className="bg-surface-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-full items-center justify-center px-5 py-10"
      >
        {/* Animated gear */}
        <Animated.Text
          style={{ fontSize: 72, marginBottom: 16, transform: [{ scale: pulse }] }}
        >
          ⚙️
        </Animated.Text>

        <Text className="mb-1 text-center text-xl font-extrabold text-text-primary">
          Maintenance Mode
        </Text>
        <Text className="mb-6 text-center text-sm text-text-secondary">
          Easy Ride Chakwal abhi maintenance par hai. Thodi dair mein wapas aayein.
        </Text>

        {/* Countdown */}
        <View className="mb-6 w-full items-center rounded-2xl border border-border bg-white p-5 shadow-sm">
          <Text className="mb-1 text-[11px] uppercase tracking-widest text-text-tertiary">
            Estimated Completion
          </Text>
          <Text className="text-4xl font-black tabular-nums text-primary">{countdown}</Text>
          <Text className="mt-1 text-xs text-text-tertiary">minutes remaining</Text>
        </View>

        {/* Progress timeline */}
        <View className="mb-6 w-full overflow-hidden rounded-2xl border border-border bg-white p-4">
          <Text className="mb-3 text-[11px] font-bold uppercase text-text-tertiary">
            Progress Timeline
          </Text>
          {timelineSteps.map((step, i) => (
            <View key={step.label} className="flex-row items-start gap-3">
              {/* Vertical connector */}
              <View className="items-center">
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    step.done
                      ? 'border-success bg-success'
                      : step.active
                        ? 'border-accent bg-accent'
                        : 'border-border bg-surface-muted'
                  }`}
                >
                  {step.done ? (
                    <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>✓</Text>
                  ) : step.active ? (
                    <Text style={{ fontSize: 9, color: '#111' }}>●</Text>
                  ) : null}
                </View>
                {i < timelineSteps.length - 1 && (
                  <View className={`w-0.5 flex-1 ${step.done ? 'bg-success' : 'bg-border'}`} style={{ minHeight: 16 }} />
                )}
              </View>
              <Text
                className={`mb-3 flex-1 text-[12px] ${
                  step.done
                    ? 'text-success'
                    : step.active
                      ? 'font-bold text-text-primary'
                      : 'text-text-tertiary'
                }`}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* WhatsApp support */}
        <Pressable
          onPress={openWhatsApp}
          className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 active:opacity-85"
        >
          <Text className="text-base">💬</Text>
          <Text className="text-sm font-extrabold text-white">WhatsApp Support</Text>
        </Pressable>

        <Text className="mt-3 text-center text-[11px] text-text-tertiary">
          {brand.supportPhone} — 24/7 Available
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
