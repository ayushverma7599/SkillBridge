import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';
import { learningAPI } from '../../services/api';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import AnimatedProgressBar from '../../components/ui/AnimatedProgressBar';
import GradientButton from '../../components/ui/GradientButton';
import { colors, gradients, radius, spacing, shadow } from '../../constants/appTheme';

export default function LearnScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [plan, setPlan] = useState(null);
  const [expandedConcept, setExpandedConcept] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const subjectsRes = await learningAPI.getSubjects();
      const firstSubject = subjectsRes.data.subjects?.[0] || null;
      setSubject(firstSubject);

      if (firstSubject) {
        const planRes = await learningAPI.getStudyPlan(firstSubject);
        setPlan(planRes.data);
      }
    } catch (error) {
      console.error('Failed to load learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const startQuiz = () => {
    if (!subject) return;
    router.push({ pathname: '/learning/quiz', params: { subject } });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      >
        <LinearGradient colors={gradients.hero} style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroTop}>
              <Ionicons name="bulb" size={20} color={colors.white} />
              <Text style={styles.heroTitle}>AI Learning Gap Detector</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              Take a quick diagnostic and we'll pinpoint exactly which concepts you're weak on — with a study
              plan that adapts every time you retest.
            </Text>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.body}>
          {subject && (
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.subjectChip}>
              <Ionicons name="school-outline" size={13} color={colors.primary} />
              <Text style={styles.subjectChipText}>{subject}</Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(120).duration(400)}>
            <GradientButton
              title={plan ? 'Retake diagnostic quiz' : 'Start diagnostic quiz'}
              onPress={startQuiz}
              icon={<Ionicons name="flash" size={17} color={colors.white} />}
            />
          </Animated.View>

          {!loading && !plan && (
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={36} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>No study plan yet</Text>
              <Text style={styles.emptyText}>
                Answer a short set of questions and we'll analyze exactly which concepts need work.
              </Text>
            </Animated.View>
          )}

          {plan && (
            <>
              {plan.weakConcepts.length > 0 ? (
                <>
                  <Animated.Text entering={FadeInDown.delay(180)} style={styles.sectionTitle}>
                    Your weak concepts
                  </Animated.Text>
                  {plan.weakConcepts.map((concept, index) => {
                    const expanded = expandedConcept === concept.conceptId;
                    return (
                      <Animated.View
                        key={concept.conceptId}
                        entering={FadeInDown.delay(220 + index * 70).duration(400)}
                        layout={Layout}
                        style={styles.conceptCard}
                      >
                        <AnimatedPressable
                          haptic={false}
                          onPress={() => setExpandedConcept(expanded ? null : concept.conceptId)}
                          style={styles.conceptHeader}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.conceptName}>{concept.name}</Text>
                            <AnimatedProgressBar progress={concept.accuracy} color={colors.danger} style={{ marginTop: 8 }} />
                          </View>
                          <View style={styles.accuracyBadge}>
                            <Text style={styles.accuracyBadgeText}>{concept.accuracy}%</Text>
                          </View>
                          <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={colors.textFaint}
                            style={{ marginLeft: 8 }}
                          />
                        </AnimatedPressable>

                        {expanded && (
                          <Animated.View entering={FadeIn.duration(250)} style={styles.conceptBody}>
                            <View style={styles.tipBox}>
                              <Ionicons name="bulb-outline" size={15} color={colors.primary} />
                              <Text style={styles.tipText}>{concept.studyTip}</Text>
                            </View>
                            {concept.practiceQuestions.map((pq) => (
                              <View key={pq.id} style={styles.practiceQuestion}>
                                <Text style={styles.practiceQuestionText}>{pq.text}</Text>
                                {pq.options.map((opt, i) => (
                                  <View
                                    key={i}
                                    style={[styles.practiceOption, i === pq.correctIndex && styles.practiceOptionCorrect]}
                                  >
                                    <Ionicons
                                      name={i === pq.correctIndex ? 'checkmark-circle' : 'ellipse-outline'}
                                      size={14}
                                      color={i === pq.correctIndex ? colors.success : colors.textFaint}
                                    />
                                    <Text
                                      style={[
                                        styles.practiceOptionText,
                                        i === pq.correctIndex && styles.practiceOptionTextCorrect,
                                      ]}
                                    >
                                      {opt}
                                    </Text>
                                  </View>
                                ))}
                                <Text style={styles.practiceExplanation}>{pq.explanation}</Text>
                              </View>
                            ))}
                          </Animated.View>
                        )}
                      </Animated.View>
                    );
                  })}
                </>
              ) : (
                <Animated.View entering={FadeInDown.delay(180)} style={styles.allGoodCard}>
                  <Ionicons name="checkmark-circle" size={26} color={colors.success} />
                  <Text style={styles.allGoodText}>No weak concepts right now — nice work.</Text>
                </Animated.View>
              )}

              {plan.strongConcepts?.length > 0 && (
                <Animated.View entering={FadeInDown.delay(280)} style={styles.strongSection}>
                  <Text style={styles.strongTitle}>Solid concepts</Text>
                  <View style={styles.strongRow}>
                    {plan.strongConcepts.map((c) => (
                      <View key={c.conceptId} style={styles.strongChip}>
                        <Ionicons name="checkmark" size={12} color={colors.success} />
                        <Text style={styles.strongChipText}>{c.name}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 120 },
  hero: { paddingBottom: spacing.xl },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  heroTitle: { fontSize: 21, fontWeight: '800', color: colors.white, letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, marginTop: -spacing.md },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  subjectChipText: { fontSize: 12.5, fontWeight: '600', color: colors.primaryDark },
  emptyState: { alignItems: 'center', gap: 8, padding: spacing.xl, marginTop: spacing.md },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  conceptCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.sm, ...shadow.sm, overflow: 'hidden' },
  conceptHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  conceptName: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  accuracyBadge: { backgroundColor: colors.dangerSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, marginLeft: 10 },
  accuracyBadgeText: { color: colors.danger, fontWeight: '700', fontSize: 12.5 },
  conceptBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  tipBox: { flexDirection: 'row', gap: 8, backgroundColor: colors.primarySoft, padding: 12, borderRadius: radius.md, marginBottom: spacing.md },
  tipText: { flex: 1, fontSize: 12.5, color: colors.primaryDark, lineHeight: 18 },
  practiceQuestion: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginBottom: 10 },
  practiceQuestionText: { fontSize: 13.5, fontWeight: '600', color: colors.text, marginBottom: 8 },
  practiceOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  practiceOptionCorrect: {},
  practiceOptionText: { fontSize: 13, color: colors.textMuted },
  practiceOptionTextCorrect: { color: colors.success, fontWeight: '700' },
  practiceExplanation: { fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 17, fontStyle: 'italic' },
  allGoodCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.successSoft, padding: spacing.md, borderRadius: radius.lg, marginTop: spacing.lg },
  allGoodText: { flex: 1, color: '#1B7A43', fontWeight: '600', fontSize: 13.5 },
  strongSection: { marginTop: spacing.lg },
  strongTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8 },
  strongRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  strongChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.successSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  strongChipText: { fontSize: 12, fontWeight: '600', color: '#1B7A43' },
});
