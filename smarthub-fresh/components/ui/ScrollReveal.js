import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fades + slides a section up as the page is scrolled toward it — the same
// "content reveals as you scroll" effect used across the Freelancer.in
// homepage. `scrollY` is a shared value fed by the parent's onScroll.
export default function ScrollReveal({ children, scrollY, style, distance = 46 }) {
  const [sectionY, setSectionY] = useState(null);

  const onLayout = (e) => {
    if (sectionY === null) setSectionY(e.nativeEvent.layout.y);
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (sectionY === null) return { opacity: 0 };
    const start = sectionY - SCREEN_HEIGHT * 0.82;
    const end = sectionY - SCREEN_HEIGHT * 0.52;
    const opacity = interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [start, end], [distance, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View onLayout={onLayout} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
