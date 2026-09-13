import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { learningAPI } from '../../services/api';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import AnimatedProgressBar from '../../components/ui/AnimatedProgressBar';
import GradientButton from '../../components/ui/GradientButton';
import { colors, gradients, radius, spacing, shadow } from '../../constants/appTheme';

export default function QuizScreen() {
  const { subject } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedConcept, setExpandedConcept] = useState(null);

  useEffect(() => {
    if (!subject) return;
    (async () => {
      try {
        setLoading(true);
        const res = await learningAPI.getQuiz(subject);
        setQuestions(res.data.questions || []);
      } catch (error) {
        Alert.alert('Error', 'Could not load the diagnostic quiz');
        console.error('Failed to load quiz:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [subject]);

  const selectAnswer = (questionId, index) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] }));
      const res = await learningAPI.submitAttempt(subject, payload);
      setResult(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit quiz');
      console.error('Failed to submit attempt:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Everything below renders inside one persistent tree (loading / result /
  // quiz-taking are all conditional *inside* the same mounted ScrollView)
  // rather than early-returning a different component tree per state.
  // Reanimated's web `entering` animation can get stuck at
  // `visibility: hidden` when the animated view it's attached to only
  // mounts *after* an early return resolves — this reliably reproduced as
  // "the screen never shows anything" when this route was pushed via
  // client-side navigation (a fresh page load always worked, which made it
  // easy to miss in testing).
  return (
    <View style={styles.container}>
      {!loading && !result && (
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {answeredCount} of {questions.length} answered
          </Text>
          <AnimatedProgressBar
            progress={questions.length ? (answeredCount / questions.length) * 100 : 0}
            color={colors.primary}
            height={6}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={result ? styles.resultContent : styles.quizContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : result ? (
          <>
            <Animated.View entering={FadeInDown.duration(450)}>
              <LinearGradient colors={gradients.hero} style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Diagnostic complete</Text>
                <Text style={styles.scoreNumber}>{result.scorePercent}%</Text>
                <Text style={styles.scoreSub}>
                  {result.correctCount} of {result.totalQuestions} correct
                </Text>
              </LinearGradient>
            </Animated.View>

            {result.weakConcepts.length > 0 ? (
              <>
                <Animated.Text entering={FadeInDown.delay(100)} style={styles.sectionTitle}>
                  Your gaps — ranked worst first
                </Animated.Text>
                {result.weakConcepts.map((concept, index) => {
                  const expanded = expandedConcept === concept.conceptId;
                  return (
                    <Animated.View
                      key={concept.conceptId}
                      entering={FadeInDown.delay(150 + index * 80).duration(400)}
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
                          <Text style={styles.practiceLabel}>Practice questions</Text>
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
                                    size={15}
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
              <Animated.View entering={FadeInDown.delay(100)} style={styles.allGoodCard}>
                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                <Text style={styles.allGoodText}>No weak concepts this time — solid work.</Text>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(250)} style={{ marginTop: spacing.lg }}>
              <GradientButton title="Back to study plan" onPress={() => router.replace('/(tabs)/learn')} />
            </Animated.View>
          </>
        ) : (
          <>
            {questions.map((q, qIndex) => (
              <Animated.View
                key={q.id}
                entering={FadeInDown.delay(Math.min(qIndex, 6) * 60).duration(400)}
                style={styles.questionCard}
              >
                <Text style={styles.conceptTag}>{q.conceptName}</Text>
                <Text style={styles.questionText}>
                  {qIndex + 1}. {q.text}
                </Text>
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <AnimatedPressable
                      key={i}
                      onPress={() => selectAnswer(q.id, i)}
                      style={[styles.optionRow, selected && styles.optionRowSelected]}
                      haptic={false}
                    >
                      <View style={[styles.radio, selected && styles.radioSelected]}>
                        {selected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt}</Text>
                    </AnimatedPressable>
                  );
                })}
              </Animated.View>
            ))}

            <GradientButton
              title={allAnswered ? 'Submit quiz' : `Answer all questions (${answeredCount}/${questions.length})`}
              onPress={handleSubmit}
              loading={submitting}
              disabled={!allAnswered}
              style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progressHeader: { padding: spacing.md, backgroundColor: colors.surface, ...shadow.sm },
  progressText: { fontSize: 12.5, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  quizContent: { padding: spacing.md, paddingBottom: spacing.xl },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  conceptTag: { fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  questionText: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12, lineHeight: 21 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 8,
  },
  optionRowSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.textFaint, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.primary },
  optionText: { flex: 1, fontSize: 14, color: colors.text },
  optionTextSelected: { fontWeight: '700', color: colors.primaryDark },

  resultContent: { padding: spacing.md, paddingBottom: spacing.xl },
  scoreCard: { borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', ...shadow.md },
  scoreLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  scoreNumber: { color: colors.white, fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  scoreSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  conceptCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.sm, ...shadow.sm, overflow: 'hidden' },
  conceptHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  conceptName: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  accuracyBadge: { backgroundColor: colors.dangerSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, marginLeft: 10 },
  accuracyBadgeText: { color: colors.danger, fontWeight: '700', fontSize: 12.5 },
  conceptBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  tipBox: { flexDirection: 'row', gap: 8, backgroundColor: colors.primarySoft, padding: 12, borderRadius: radius.md, marginBottom: spacing.md },
  tipText: { flex: 1, fontSize: 12.5, color: colors.primaryDark, lineHeight: 18 },
  practiceLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  practiceQuestion: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginBottom: 10 },
  practiceQuestionText: { fontSize: 13.5, fontWeight: '600', color: colors.text, marginBottom: 8 },
  practiceOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  practiceOptionCorrect: {},
  practiceOptionText: { fontSize: 13, color: colors.textMuted },
  practiceOptionTextCorrect: { color: colors.success, fontWeight: '700' },
  practiceExplanation: { fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 17, fontStyle: 'italic' },
  allGoodCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.successSoft, padding: spacing.md, borderRadius: radius.lg, marginTop: spacing.lg },
  allGoodText: { flex: 1, color: '#1B7A43', fontWeight: '600', fontSize: 13.5 },
});
