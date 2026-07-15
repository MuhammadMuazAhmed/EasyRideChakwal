import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useEmergencyContacts } from '@/shared/hooks/useQueries';
import { LoadingState } from '@/shared/components/common/StateViews';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'EmergencyContacts'>;

export function EmergencyContactsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: contacts, isLoading } = useEmergencyContacts();

  if (isLoading) return <LoadingState message="Loading contacts..." />;

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Emergency Contacts"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 p-3">
        <Text className="mb-3 text-xs text-text-secondary">
          Up to 3 contacts will receive your live location when SOS is activated.
        </Text>
        {contacts?.map((contact) => (
          <Card key={contact.id} className="mb-2">
            <View className="flex-row items-center gap-2.5">
              <Avatar initials={contact.name.split(' ').map((n) => n[0]).join('')} size="md" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-text-primary">{contact.name}</Text>
                <Text className="text-[11px] text-text-tertiary">{contact.relationship}</Text>
                <Text className="text-xs text-text-secondary">{contact.phone}</Text>
              </View>
            </View>
          </Card>
        ))}
        <Button title="+ Add Contact" variant="yellow" onPress={() => {}} />
      </ScrollView>
    </ScreenContainer>
  );
}
