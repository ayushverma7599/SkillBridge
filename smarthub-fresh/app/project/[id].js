import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { projectAPI } from '../../services/api';
import GradientButton from '../../components/ui/GradientButton';
import { colors, radius, spacing, shadow } from '../../constants/appTheme';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjectById(id);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to load project:', error);
      Alert.alert('Error', 'Could not load this project');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      const response = await projectAPI.applyToProject(project.id);

      if (response.data.workloadWarning) {
        Alert.alert('Application submitted — heads up', response.data.workloadWarning);
      } else {
        Alert.alert('Success', 'Your application was submitted!');
      }
      router.back();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply';
      Alert.alert('Could not apply', message);
    } finally {
      setApplying(false);
    }
  };

  // Kept as one persistent tree (spinner / not-found / content all render
  // inside the same mounted Animated.View) rather than early-returning a
  // different component tree per state. Reanimated's web `entering`
  // animation can get stuck at `visibility: hidden` when the animated view
  // it's attached to only mounts *after* an early return resolves — this
  // reliably reproduced as "the screen never shows" when reached via
  // client-side navigation (as opposed to a fresh page load, which always
  // worked, making it easy to miss in testing).
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(450)} style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xl }} />
        ) : !project ? (
          <Text>Project not found</Text>
        ) : (
          <>
            <Text style={styles.title}>{project.title}</Text>

            <View style={styles.chipRow}>
              <View style={[styles.statChip, styles.budgetChip]}>
                <Ionicons name="cash-outline" size={13} color={colors.success} />
                <Text style={[styles.statChipText, { color: colors.success }]}>₹{project.budget}</Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="pricetag-outline" size={13} color={colors.textMuted} />
                <Text style={styles.statChipText}>{project.category}</Text>
              </View>
              {project.estimatedHoursPerWeek ? (
                <View style={styles.statChip}>
                  <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.statChipText}>~{project.estimatedHoursPerWeek}h/week</Text>
                </View>
              ) : null}
            </View>

            {project.college && (
              <View style={styles.collegeChip}>
                <Ionicons name="school-outline" size={14} color={colors.primary} />
                <Text style={styles.collegeChipText}>Posted by {project.college.name}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{project.description}</Text>

            <Text style={styles.sectionLabel}>Posted by</Text>
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {project.freelancer?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.authorName}>{project.freelancer?.fullName}</Text>
            </View>

            <GradientButton
              title="Apply Now"
              onPress={handleApply}
              loading={applying}
              style={styles.applyButton}
              icon={<Ionicons name="paper-plane-outline" size={17} color={colors.white} />}
            />
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 14, letterSpacing: -0.3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  budgetChip: { backgroundColor: colors.successSoft },
  statChipText: { fontSize: 12.5, fontWeight: '600', color: colors.textMuted },
  collegeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    marginBottom: 6,
  },
  collegeChipText: { fontSize: 12.5, fontWeight: '600', color: colors.primaryDark },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted, marginTop: spacing.sm, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  description: { fontSize: 15, color: colors.text, lineHeight: 22 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  authorAvatarText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  authorName: { fontSize: 14.5, color: colors.text, fontWeight: '600' },
  applyButton: { marginTop: spacing.xl },
});
