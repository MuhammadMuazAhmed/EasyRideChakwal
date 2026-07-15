import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar } from '@/shared/components/common/TopBar';
import { quickReplies } from '@/shared/constants/mockData';
import type { RiderStackParamList } from '@/navigation/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { RideService } from '@/api/services/rideService';
import { useRideStore } from '@/rider/store/rideStore';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

export function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const { data: rawMessages = [] } = useQuery({
    queryKey: ['chatMessages', currentRide?.id],
    queryFn: () => RideService.getChatMessages(currentRide!.id),
    enabled: !!currentRide?.id,
    refetchInterval: 2500, // Poll every 2.5s
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => RideService.sendChatMessage(currentRide!.id, text),
  });

  const messages: Message[] = rawMessages.map((msg: any) => {
    const d = new Date(msg.timestamp);
    return {
      id: msg._id ?? String(msg.timestamp),
      text: msg.text,
      fromMe: (msg.senderRole ?? msg.sender) === 'rider',
      time: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`,
    };
  });

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !currentRide?.id) return;

    sendMutation.mutate(trimmed);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <View className="flex-1 bg-surface-background">
      <TopBar
        title="Abdul Rehman"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
        rightAction={<Text className="text-base">📞</Text>}
      />
      <View className="border-b border-border bg-green-50 px-2.5 py-2">
        <Text className="text-[10px] text-success">
          📍 Driver 1.2km away — Numbers are private and masked
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-2.5 py-2.5"
        contentContainerClassName="gap-2 pb-2"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) =>
          msg.fromMe ? (
            <View key={msg.id} className="max-w-[80%] self-end">
              <View className="rounded-xl rounded-br-sm bg-primary p-2.5">
                <Text className="text-xs text-white">{msg.text}</Text>
                <Text className="mt-0.5 text-right text-[10px] text-[#888888]">
                  {msg.time} ✓✓
                </Text>
              </View>
            </View>
          ) : (
            <View key={msg.id} className="max-w-[80%] self-start">
              <View className="rounded-xl rounded-bl-sm border border-border bg-white p-2.5">
                <Text className="text-xs text-text-primary">{msg.text}</Text>
                <Text className="mt-0.5 text-right text-[10px] text-text-tertiary">{msg.time}</Text>
              </View>
            </View>
          )
        )}

        <Text className="self-center text-[10px] text-text-tertiary">Quick Replies</Text>
        <View className="flex-row flex-wrap justify-center gap-1">
          {quickReplies.map((reply) => (
            <Pressable
              key={reply}
              onPress={() => handleQuickReply(reply)}
              className="rounded-2xl border-[1.5px] border-border bg-white px-2.5 py-1 active:bg-surface-muted"
            >
              <Text className="text-[10px] font-semibold text-text-primary">{reply}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row gap-2 border-t border-border bg-white p-2.5">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message likhein..."
          placeholderTextColor="#888888"
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
          className="flex-1 rounded-lg border-[1.5px] border-border bg-surface-muted px-2.5 py-2 text-xs text-text-primary"
        />
        <Pressable
          onPress={() => sendMessage(input)}
          className={`rounded-lg px-3 py-2 ${input.trim() ? 'bg-primary' : 'bg-surface-muted'}`}
        >
          <Text className={`text-xs font-bold ${input.trim() ? 'text-accent' : 'text-text-tertiary'}`}>
            Send
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
