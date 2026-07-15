import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { StarRating, FeedbackTag } from '@/rider/components/ride/RideComponents';
import { ratingTags } from '@/shared/constants/mockData';
import { useRideStore } from '@/rider/store/rideStore';
import { RideService } from '@/api/services/rideService';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Rating'>;

export function RatingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const driver = currentRide?.driver;
  const [rating, setRating] = useState(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Safe Driving ✓', 'On Time ✓', 'Clean Car ✓']);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (currentRide?.id) {
        await RideService.rateRide({
          rideId: currentRide.id,
          rating,
          tags: selectedTags,
          comment,
        });
      }
      useRideStore.getState().resetBooking();
      navigation.navigate('MainTabs', { screen: 'Home' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    useRideStore.getState().resetBooking();
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <ScreenContainer className="bg-white">
      <TopBar title="Apna Experience Share Karein" />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="items-center">
          <Badge label="Trip Complete!" variant="green" className="mb-3" />
          <Avatar initials={driver?.avatarInitials ?? 'AR'} size="xl" className="mb-1.5" />
          <Text className="text-[15px] font-bold text-text-primary">
            {driver ? `${driver.firstName} ${driver.lastName}` : 'Abdul Rehman'}
          </Text>
          <Text className="mb-4 text-[11px] text-text-tertiary">
            {currentRide?.pickup.name} → {currentRide?.destination.name}
          </Text>

          <Text className="mb-2 text-xs text-text-secondary">Ride ko rate karein</Text>
          <StarRating rating={rating} onRate={setRating} />

          <Text className="mb-2 mt-4 self-start text-xs text-text-secondary">Feedback chips</Text>
          <View className="mb-4 flex-row flex-wrap gap-1.5 self-start">
            {ratingTags.map((tag) => (
              <FeedbackTag
                key={tag}
                label={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Koi aur baat? (Optional comment)"
            placeholderTextColor="#888888"
            multiline
            className="mb-4 h-16 w-full rounded-lg border-[1.5px] border-border bg-surface-muted p-3 text-xs text-text-primary"
          />

          <Button
            title={`Rating Submit Karein ${'★'.repeat(rating)}`}
            loading={loading}
            onPress={() => void handleSubmit()}
            className="mb-2 w-full"
          />
          <Pressable onPress={handleSkip}>
            <Text className="text-[11px] text-text-tertiary">Skip karein →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
