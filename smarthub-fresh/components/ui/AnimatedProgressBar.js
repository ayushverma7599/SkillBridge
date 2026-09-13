import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '../../constants/appTheme';

// Progress bar that eases its fill in on mount/update instead of snapping —
// used for workload capacity and AI match-score bars.
export default function AnimatedProgressBar({
  progress = 0,
  color = colors.primary,
  height = 8,
  delay = 0,
  style,
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(Math.max(0, Math.min(100, progress)), {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, borderRadius: height / 2 },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
