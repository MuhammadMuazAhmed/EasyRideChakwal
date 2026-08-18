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

import { ScreenContainer } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/theme';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAR_WIDTH = Math.min(SCREEN_WIDTH * 1.05, 460);
const CAR_HEIGHT = CAR_WIDTH * (836 / 1881);

const WHEEL_SIZE = CAR_WIDTH * 0.13;

const REAR_WHEEL_LEFT = CAR_WIDTH * 0.24;
const FRONT_WHEEL_LEFT = CAR_WIDTH * 0.629;

const WHEEL_TOP = CAR_HEIGHT * 0.497;

const CONTAINER_HEIGHT = CAR_HEIGHT + WHEEL_SIZE * 0.2;

const START_X = SCREEN_WIDTH + CAR_WIDTH;
const END_X = -(SCREEN_WIDTH + CAR_WIDTH);

export function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [isNavigating, setIsNavigating] = useState(false);

  const translateX = useSharedValue(START_X);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Drive in from right (START_X) to center (translateX = 0) with smooth deceleration (slower)
    translateX.value = withTiming(0, {
      duration: 2200,
      easing: Easing.out(Easing.cubic),
    });
    // Rotate wheels counter-clockwise (car moving right to left)
    rotation.value = withTiming(-720, {
      duration: 2200,
      easing: Easing.out(Easing.cubic),
    });
  }, [translateX, rotation]);

  const handleStart = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    const onComplete = () => {
      navigation.navigate('PhoneNumber');
    };

    // Drive out off-screen to the left (END_X) with smooth acceleration (slower)
    translateX.value = withTiming(
      END_X,
      {
        duration: 1500,
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
      duration: 1500,
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
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
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

        <Text style={{ color: theme.textPrimary }} className="mb-2 text-center text-2xl font-black">
          Easy Ride Chakwal
        </Text>
        <Text style={{ color: theme.textSecondary }} className="mb-8 text-center text-sm">
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
    </ScreenContainer>
  );
}
