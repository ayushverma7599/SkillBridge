import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import apiClient, { scheduleAPI } from '../../services/api';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import AnimatedProgressBar from '../../components/ui/AnimatedProgressBar';
import { colors, gradients, radius, spacing, shadow, statusColors } from '../../constants/appTheme';

const STATUS_COPY: Record<string, { label: string }> = {
  normal: { label: 'On track' },
  reduced: { label: 'Reduced capacity' },
  exam_lockdown: { label: 'Exam lockdown' },
};

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [workload, setWorkload] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [profileRes, workloadRes] = await Promise.all([
        apiClient.get('/profile').catch(() => null),
        scheduleAPI.getWorkload().catch(() => null),
      ]);
      if (profileRes) setProfile(profileRes.data);
      if (workloadRes) setWorkload(workloadRes.data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const status = workload ? statusColors[workload.status] || statusColors.normal : null;
  const statusLabel = workload ? (STATUS_COPY[workload.status] || STATUS_COPY.normal).label : '';

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      >
        <SafeAreaView edges={['top']} style={styles.header}>
          <Animated.View entering={FadeInDown.duration(450)}>
            <Text style={styles.eyebrow}>
              {profile?.isVerified ? `Verified · ${profile.university || 'campus'}` : 'Welcome to'}
            </Text>
            <Text style={styles.greeting}>
              {profile?.fullName ? `Hi, ${profile.fullName.split(' ')[0]} 👋` : 'SkillBridge'}
            </Text>
          </Animated.View>
        </SafeAreaView>

        <Animated.View entering={FadeInDown.delay(100).duration(450)}>
          <LinearGradient colors={status ? status.gradient : gradients.primary} style={styles.workloadCard}>
            <View style={styles.workloadHeaderRow}>
              <Text style={styles.workloadLabel}>This week's freelance capacity</Text>
              <Ionicons name="pulse" size={18} color="rgba(255,255,255,0.85)" />
            </View>

            {loading && !workload ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={colors.white} />
            ) : workload ? (
              <>
                <View style={styles.hoursRow}>
                  <Text style={styles.hoursNumber}>{workload.allowedHoursThisWeek}h</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{statusLabel}</Text>
                  </View>
                </View>
                <AnimatedProgressBar
                  progress={(workload.allowedHoursThisWeek / workload.baseCap) * 100}
                  color={colors.white}
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                  delay={200}
                />
                {workload.reasons?.map((reason: string, i: number) => (
                  <Text key={i} style={styles.reason}>
                    · {reason}
                  </Text>
                ))}
                <AnimatedPressable
                  onPress={() => router.push('/(tabs)/schedule')}
                  style={styles.manageButton}
                  haptic={false}
                >
                  <Text style={styles.manageButtonText}>Manage academic schedule</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.white} />
                </AnimatedPressable>
              </>
            ) : (
              <Text style={styles.reason}>Could not load your workload right now.</Text>
            )}
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(450)} style={styles.quickLinks}>
          <AnimatedPressable style={styles.linkCard} onPress={() => router.push('/(tabs)/projects')}>
            <View style={[styles.linkIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="briefcase" size={20} color={colors.primary} />
            </View>
            <Text style={styles.linkTitle}>Browse Projects</Text>
            <Text style={styles.linkSubtitle}>Campus-verified freelance work</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.linkCard} onPress={() => router.push('/(tabs)/recommendations')}>
            <View style={[styles.linkIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
            </View>
            <Text style={styles.linkTitle}>For You</Text>
            <Text style={styles.linkSubtitle}>AI-matched to your skills</Text>
          </AnimatedPressable>
        </Animated.View>

        {profile && !profile.isVerified && (
          <Animated.View entering={FadeInUp.delay(280).duration(450)} style={styles.verifyBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.verifyBannerText}>
              Your account isn't verified yet — verify your campus email for full access.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  eyebrow: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  workloadCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.md,
  },
  workloadHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  workloadLabel: { fontSize: 13.5, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  hoursRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  hoursNumber: { fontSize: 38, fontWeight: '800', color: colors.white, letterSpacing: -1 },
  statusPill: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  statusPillText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  reason: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 8 },
  manageButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16 },
  manageButtonText: { color: colors.white, fontSize: 13.5, fontWeight: '700' },
  quickLinks: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginTop: spacing.lg },
  linkCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  linkIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  linkTitle: { fontSize: 14.5, fontWeight: '700', color: colors.text, marginBottom: 3 },
  linkSubtitle: { fontSize: 12, color: colors.textMuted, lineHeight: 16 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.warningSoft,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  verifyBannerText: { flex: 1, color: '#8A5A00', fontSize: 12.5, lineHeight: 17 },
});
