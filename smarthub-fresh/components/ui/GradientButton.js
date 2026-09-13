import React from 'react';
import { StyleSheet, ActivityIndicator, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedPressable from './AnimatedPressable';
import { colors, gradients, radius, shadow } from '../../constants/appTheme';

// The single primary CTA style used across auth, home and project screens —
// a gradient-filled pill button with press-scale + loading state built in.
export default function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  colorsProp,
  style,
  textStyle,
  icon,
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, (disabled || loading) && styles.disabled, style]}
    >
      <LinearGradient
        colors={colorsProp || gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.full,
    ...shadow.md,
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.full,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
