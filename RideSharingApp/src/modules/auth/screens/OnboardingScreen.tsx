import { useEffect, useState } from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import { Button } from '@/shared/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAR_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 300);
const CAR_HEIGHT = CAR_WIDTH * (836 / 1881);
const WHEEL_SIZE = CAR_WIDTH * 0.24;
const REAR_WHEEL_LEFT = CAR_WIDTH * 0.14;
const FRONT_WHEEL_LEFT = CAR_WIDTH * 0.62;
const WHEEL_TOP = CAR_HEIGHT * 0.42;
const CONTAINER_HEIGHT = CAR_HEIGHT + WHEEL_SIZE * 0.3;

const START_X = SCREEN_WIDTH + CAR_WIDTH;
const END_X = -(SCREEN_WIDTH + CAR_WIDTH);

export function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isNavigating, setIsNavigating] = useState(false);

  const translateX = useSharedValue(START_X);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Drive in from right (START_X) to center (translateX = 0) with smooth deceleration
    translateX.value = withTiming(0, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
    // Rotate wheels counter-clockwise (car moving right to left)
    rotation.value = withTiming(-720, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [translateX, rotation]);

  const handleStart = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    const onComplete = () => {
      navigation.navigate('PhoneNumber');
    };

    // Drive out off-screen to the left (END_X) with smooth acceleration
    translateX.value = withTiming(
      END_X,
      {
        duration: 900,
        easing: Easing.in(Easing.quad),
      },
      (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }
    );

    // Continue wheel rotation to the left
    rotation.value = withTiming(-1440, {
      duration: 900,
      easing: Easing.in(Easing.quad),
    });
  };

  const carAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {/* Animated Vehicle Assembly Container */}
      <View
        className="mb-8 items-center justify-center overflow-visible"
        style={{ height: CONTAINER_HEIGHT, width: CAR_WIDTH }}
      >
        <Animated.View style={[{ width: CAR_WIDTH, height: CONTAINER_HEIGHT }, carAnimatedStyle]}>
          {/* Car Body Base Layer */}
          <Image
            source={require('@/assets/images/car-body.png')}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: CAR_WIDTH,
              height: CAR_HEIGHT,
            }}
            resizeMode="contain"
          />

          {/* Rear Wheel */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: REAR_WHEEL_LEFT,
                top: WHEEL_TOP,
                width: WHEEL_SIZE,
                height: WHEEL_SIZE,
                zIndex: 10,
              },
              wheelAnimatedStyle,
            ]}
          >
            <Image
              source={require('@/assets/images/rear-wheel.png')}
              style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Front Wheel */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: FRONT_WHEEL_LEFT,
                top: WHEEL_TOP,
                width: WHEEL_SIZE,
                height: WHEEL_SIZE,
                zIndex: 10,
              },
              wheelAnimatedStyle,
            ]}
          >
            <Image
              source={require('@/assets/images/front-wheel.png')}
              style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </View>

      <Text className="mb-2 text-center text-2xl font-black text-text-primary">
        Easy Ride Chakwal
      </Text>
      <Text className="mb-8 text-center text-sm text-text-secondary">
        Apne shehar mein sab se safe aur fast ride service
      </Text>
      <Button
        title="Shuru Karein →"
        variant="yellow"
        loading={isNavigating}
        disabled={isNavigating}
        onPress={handleStart}
      />
    </View>
  );
}


