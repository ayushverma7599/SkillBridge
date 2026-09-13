import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, radius, shadow } from '../../constants/appTheme';

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.15 : 1, { damping: 12, stiffness: 200 }) }],
    marginTop: withSpring(focused ? -2 : 0, { damping: 12, stiffness: 200 }),
  }));

  return (
    <View style={styles.iconWrap}>
      <Animated.View style={animatedStyle}>
        <Ionicons name={focused ? name : (`${name}-outline` as any)} size={23} color={color} />
      </Animated.View>
      {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.96)' }]} />
          ) : (
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, focused }) => <TabIcon name="briefcase" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: 'For You',
          tabBarIcon: ({ color, focused }) => <TabIcon name="sparkles" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => <TabIcon name="bulb" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: 16,
    bottom: Platform.select({ ios: 28, default: 16 }),
    height: 66,
    borderRadius: radius.xl,
    borderTopWidth: 0,
    overflow: 'hidden',
    ...shadow.lg,
  },
  item: { paddingTop: 8, paddingHorizontal: 2 },
  label: { fontSize: 10, fontWeight: '600', marginTop: -2 },
  iconWrap: { alignItems: 'center', justifyContent: 'center', height: 26 },
  dot: { position: 'absolute', bottom: -8, width: 4, height: 4, borderRadius: 2 },
});
