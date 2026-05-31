import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { DURATION, TACTILE } from '@/constants/motion';

interface MotionViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * A modular animation wrapper that implements Emil's "nothing appears from nothing" principle.
 * Uses a soft scale (0.95 -> 1.0) and fade in.
 */
export function MotionView({ 
  children, 
  delay = 0, 
  duration = DURATION.popover, 
  style 
}: MotionViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(TACTILE.enteringScale)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
