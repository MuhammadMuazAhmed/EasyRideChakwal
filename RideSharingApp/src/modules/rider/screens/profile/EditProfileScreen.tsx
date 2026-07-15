import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useProfile } from '@/shared/hooks/useQueries';
import { getInitials } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/api/services/userService';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { UpdateProfilePayload } from '@/shared/types';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;
type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) => UserService.updateProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      navigation.goBack();
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
    });
  };

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title="Edit Profile"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6 items-center">
          <Avatar
            initials={getInitials(profile?.firstName ?? 'S', profile?.lastName ?? 'A')}
            size="xl"
          />
        </View>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value } }) => (
            <Input label="First Name" value={value} onChangeText={onChange} error={errors.firstName?.message} />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value } }) => (
            <Input label="Last Name" value={value} onChangeText={onChange} error={errors.lastName?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email (Optional)"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />
        <Input label="Phone" value={profile?.phone ?? ''} editable={false} />
        <Button
          title="Save Changes"
          loading={isSubmitting || updateProfileMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
