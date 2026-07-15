import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { NotificationItem } from '@/shared/components/common/ProfileComponents';
import { LoadingState, EmptyState } from '@/shared/components/common/StateViews';
import { useNotifications } from '@/shared/hooks/useQueries';
import { useNotificationStore } from '@/store/notificationStore';
import { formatRelativeTime } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Notifications'>;

export function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  if (isLoading) return <LoadingState message="Loading notifications..." />;

  const items = notifications ?? [];

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Notifications"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
        rightAction={
          items.some((n) => !n.read) ? (
            <Pressable onPress={markAllAsRead}>
              <Text className="text-[11px] font-bold text-accent">Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <ScrollView className="flex-1 p-3">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              time={formatRelativeTime(notification.createdAt)}
              read={notification.read}
              type={notification.type}
              onPress={() => markAsRead(notification.id)}
            />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
