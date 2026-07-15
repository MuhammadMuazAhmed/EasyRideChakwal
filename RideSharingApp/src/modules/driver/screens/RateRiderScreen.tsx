import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar, ScreenContainer, BackButton } from '@/shared/components/common/TopBar';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { StarRating, FeedbackTag } from '@/rider/components/ride/RideComponents';
import { DriverService } from '@/modules/driver/services/driverService';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'RateRider'>;
type RouteProps = RouteProp<DriverStackParamList, 'RateRider'>;

const riderRatingTags = [
  'On Time at Pickup ✓',
  'Polite ✓',
  'Good Experience ✓',
  'Clear Directions',
  'Respectful',
];

export function RateRiderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { rideId, riderName } = route.params;

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['On Time at Pickup ✓', 'Polite ✓']);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const goHome = () => {
    navigation.replace('DriverTabs', { screen: 'Dashboard' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const tagComment = selectedTags.length > 0 ? selectedTags.join(', ') : undefined;
      await DriverService.rateRider(rideId, rating, comment || tagComment);
      goHome();
    } catch {
      goHome();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title="Rate Rider"
        leftAction={<BackButton onPress={goHome} />}
      />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="items-center">
          <Badge label="Trip Complete!" variant="green" className="mb-3" />
          <Avatar initials={riderName?.[0] ?? 'R'} size="xl" className="mb-1.5" />
          <Text className="text-[15px] font-bold text-text-primary">
            {riderName ?? 'Rider'}
          </Text>

          <Text className="mb-2 mt-4 text-xs text-text-secondary">Rider ko rate karein</Text>
          <StarRating rating={rating} onRate={setRating} />

          <Text className="mb-2 mt-4 self-start text-xs text-text-secondary">Feedback</Text>
          <View className="mb-4 flex-row flex-wrap gap-1.5 self-start">
            {riderRatingTags.map((tag) => (
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
            placeholder="Koi aur baat? (Optional)"
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
          <Pressable onPress={goHome}>
            <Text className="text-[11px] text-text-tertiary">Skip karein →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
