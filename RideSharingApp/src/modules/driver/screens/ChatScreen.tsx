import React, { useState, useEffect, useRef } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';

import { BackButton, TopBar } from '@/shared/components/common/TopBar';
import { ScreenContainer } from '@/shared/components/common/TopBar';
import { RideService } from '@/api/services/rideService';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'Chat'>;
type RouteProps = RouteProp<DriverStackParamList, 'Chat'>;

export function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { rideId } = route.params;

  const [text, setText] = useState('');

  // Fetch messages every 3s
  const { data: rawMessages = [] } = useQuery({
    queryKey: ['chatMessages', rideId],
    queryFn: () => RideService.getChatMessages(rideId),
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msgText: string) => RideService.sendChatMessage(rideId, msgText),
    onSuccess: () => {
      setText('');
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessageMutation.mutate(text.trim());
  };

  const messages = rawMessages.map((msg: any) => {
    const d = new Date(msg.timestamp);
    return {
      id: msg._id ?? String(msg.timestamp),
      text: msg.text,
      fromMe: (msg.senderRole ?? msg.sender) === 'driver',
      time: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
  });

  return (
    <ScreenContainer className="bg-white">
      <TopBar title="Chat with Rider" leftAction={<BackButton onPress={() => navigation.goBack()} />} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className={`my-1.5 max-w-[80%] rounded-xl px-4 py-2.5 ${item.fromMe ? 'self-end bg-accent' : 'self-start bg-gray-100'}`}>
            <Text className="text-xs font-bold text-text-primary">{item.text}</Text>
            <Text className="mt-1 text-[8px] text-text-tertiary self-end">{item.time}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        className="flex-1"
      />

      <View className="flex-row items-center border-t border-border bg-white px-4 py-3">
        <TextInput
          placeholder="Message type karein..."
          value={text}
          onChangeText={setText}
          className="flex-1 rounded-full border border-border bg-gray-50 px-4 py-2 text-xs font-semibold text-text-primary"
        />
        <Pressable onPress={handleSend} className="ml-3 rounded-full bg-accent px-4 py-2.5 active:opacity-85">
          <Text className="text-xs font-black text-primary">Send</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
