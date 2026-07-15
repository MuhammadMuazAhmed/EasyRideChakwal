import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useEmergencyContacts } from '@/shared/hooks';
import { useCurrentLocation } from '@/shared/hooks';
import { RideService } from '@/api/services/rideService';
import { useRideStore } from '@/rider/store/rideStore';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'SOS'>;

const emergencyNumbers = [
  { icon: '🚑', name: 'Rescue 1122', number: '1122' },
  { icon: '👮', name: 'Police', number: '15' },
  { icon: '🚒', name: 'Fire', number: '16' },
];

export function SOSScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const { location } = useCurrentLocation();
  const { data: contacts = [], isLoading: contactsLoading } = useEmergencyContacts();

  const [sosActive, setSosActive] = useState(false);
  const [triggering, setTriggering] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function triggerSOS() {
      if (!currentRide?.id) {
        setError('Active ride nahi mili. SOS sirf ride ke dauran use ho sakta hai.');
        setTriggering(false);
        return;
      }

      const latitude = location?.latitude ?? currentRide.pickup.coordinates.latitude;
      const longitude = location?.longitude ?? currentRide.pickup.coordinates.longitude;

      try {
        await RideService.triggerSOS(currentRide.id, latitude, longitude);
        setSosActive(true);
      } catch (err: any) {
        setError(err.response?.data?.message ?? err.message);
      } finally {
        setTriggering(false);
      }
    }

    void triggerSOS();
  }, [currentRide?.id, location?.latitude, location?.longitude, currentRide?.pickup.coordinates]);

  const handleCancelSOS = async () => {
    if (!currentRide?.id || !sosActive) {
      navigation.goBack();
      return;
    }

    try {
      await RideService.resolveSOS(currentRide.id);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? err.message);
      return;
    }

    navigation.goBack();
  };

  const callNumber = (number: string) => {
    void Linking.openURL(`tel:${number}`);
  };

  return (
    <ScreenContainer className="bg-white">
      <View className="flex-row items-center justify-between bg-danger px-3 py-2.5 pt-12">
        <Text className="text-[13px] font-extrabold text-white">🚨 SOS Emergency</Text>
        <Badge label={sosActive ? 'ACTIVE' : triggering ? 'SENDING' : 'ERROR'} variant="red" className="bg-white/20" />
      </View>
      <ScrollView className="flex-1 p-3.5">
        <View className="mb-3.5 items-center rounded-xl border-2 border-red-300 bg-danger-light p-3.5">
          <Text className="mb-1.5 text-[32px]">🚨</Text>
          {triggering ? (
            <>
              <ActivityIndicator color="#DC2626" className="mb-2" />
              <Text className="mb-1 text-[15px] font-extrabold text-danger">SOS Bheja Ja Raha Hai...</Text>
            </>
          ) : sosActive ? (
            <>
              <Text className="mb-1 text-[15px] font-extrabold text-danger">SOS Active Hai!</Text>
              <Text className="text-center text-[11px] text-red-800">
                Aapki live location backend par share ho chuki hai
              </Text>
            </>
          ) : (
            <>
              <Text className="mb-1 text-[15px] font-extrabold text-danger">SOS Fail</Text>
              <Text className="text-center text-[11px] text-red-800">{error ?? 'Unknown error'}</Text>
            </>
          )}
        </View>

        <Text className="mb-2 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          Emergency Contacts
        </Text>
        {contactsLoading ? (
          <ActivityIndicator size="small" color="#F5C400" className="py-4" />
        ) : contacts.length === 0 ? (
          <Card className="mb-2">
            <Text className="text-xs text-text-secondary">
              Koi emergency contact save nahi. Profile se contacts add karein.
            </Text>
          </Card>
        ) : (
          contacts.map((contact, index) => (
            <Card key={contact.id} className="mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Avatar
                    initials={contact.name.split(' ').map((n) => n[0]).join('')}
                    size="sm"
                  />
                  <View>
                    <Text className="text-xs font-bold text-text-primary">{contact.name}</Text>
                    <Text className="text-[10px] text-text-tertiary">{contact.relationship}</Text>
                  </View>
                </View>
                <Badge
                  label={sosActive ? (index === 0 ? 'Alerted ✓' : 'Pending') : '—'}
                  variant={sosActive && index === 0 ? 'green' : 'yellow'}
                />
              </View>
            </Card>
          ))
        )}

        <Text className="mb-2 mt-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          Emergency Numbers
        </Text>
        {emergencyNumbers.map((item) => (
          <Pressable
            key={item.number}
            onPress={() => callNumber(item.number)}
            className="mb-2 flex-row items-center gap-2.5 rounded-xl border border-border bg-white p-3"
          >
            <Text className="text-xl">{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold text-text-primary">{item.name}</Text>
              <Text className="text-sm font-extrabold text-danger">{item.number}</Text>
            </View>
            <Text className="text-xs font-bold text-accent">Call</Text>
          </Pressable>
        ))}

        <Button
          title="Cancel SOS"
          variant="outline"
          className="mt-2"
          onPress={() => void handleCancelSOS()}
        />
        <Button
          title="Manage Emergency Contacts"
          variant="ghost"
          className="mt-2"
          onPress={() => navigation.navigate('EmergencyContacts')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
