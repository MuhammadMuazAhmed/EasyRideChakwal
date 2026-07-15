import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { formatCurrency } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'ScheduleRide'>;

const timeSlots = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'];
const days = [25, 26, 27, 28, 29, 30, 1];

export function ScheduleRideScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDay, setSelectedDay] = useState(26);
  const [selectedTime, setSelectedTime] = useState('7:00 AM');

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title="Ride Schedule Karein"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 p-3">
        <View className="mb-3 items-center rounded-xl border-[1.5px] border-accent bg-accent-light p-2.5">
          <Text className="text-xs font-bold text-text-primary">Advance Booking</Text>
          <Text className="text-[10px] text-text-tertiary">Kal subah ki ride aaj hi book karein</Text>
        </View>

        <Text className="mb-1 text-[10px] font-bold uppercase text-text-secondary">Pickup Date</Text>
        <View className="mb-3 flex-row flex-wrap gap-1">
          {days.map((day) => (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              className={`min-w-[40px] items-center rounded-md px-2 py-1.5 ${
                selectedDay === day ? 'bg-primary' : 'bg-surface-muted'
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  selectedDay === day ? 'text-accent' : 'text-text-primary'
                }`}
              >
                {day}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mb-1 text-[10px] font-bold uppercase text-text-secondary">Pickup Time</Text>
        <View className="mb-3 flex-row flex-wrap gap-1.5">
          {timeSlots.map((time) => (
            <Pressable
              key={time}
              onPress={() => setSelectedTime(time)}
              className={`rounded-lg px-2.5 py-1.5 ${
                selectedTime === time ? 'bg-primary' : 'bg-surface-muted'
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  selectedTime === time ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {time}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input label="From" value="Clock Tower, Chakwal" />
        <Input label="To" value="Rawalpindi Saddar" />

        <Card className="mb-3">
          <View className="flex-row justify-between">
            <Text className="text-xs text-text-secondary">Estimated Fare</Text>
            <Text className="text-[15px] font-extrabold text-text-primary">
              {formatCurrency(1200)}
            </Text>
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-[10px] text-text-tertiary">Vehicle: Car · 78 km</Text>
            <Text className="text-[10px] text-text-tertiary">26 Jun · {selectedTime}</Text>
          </View>
        </Card>

        <Button title="Confirm Schedule Ride" onPress={() => navigation.goBack()} />
      </ScrollView>
    </ScreenContainer>
  );
}
