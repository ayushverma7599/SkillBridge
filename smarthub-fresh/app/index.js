import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  FadeIn,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import GradientButton from '../components/ui/GradientButton';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import ScrollReveal from '../components/ui/ScrollReveal';
import { dark, spacing, radius } from '../constants/appTheme';

const PILLARS = [
  {
    icon: 'shield-checkmark',
    title: 'Campus-verified',
    body: 'Every project and every student is checked against a real college email domain before they can post or apply.',
  },
  {
    icon: 'sparkles',
    title: 'AI-matched',
    body: 'Recommendations are ranked by how well a project fits your actual skills — not just what was posted most recently.',
  },
  {
    icon: 'time',
    title: 'Workload-aware',
    body: 'Log your classes and exams once. We automatically throttle how much freelance work you should take on that week.',
  },
  {
    icon: 'bulb',
    title: 'AI Learning Gap Detector',
    body: 'A short diagnostic finds exactly which concepts you’re weak on, then builds practice questions and a study plan around them.',
  },
];

const STEPS = [
  { number: '01', title: 'Get verified', body: 'Sign up with your college email — verification is instant.' },
  { number: '02', title: 'Find your fit', body: 'Browse campus-verified gigs or let AI match you automatically.' },
  { number: '03', title: 'Work safely', body: 'Your academic schedule caps how much work you take on.' },
  { number: '04', title: 'Close the gap', body: 'Run a diagnostic quiz any time and follow your adaptive study plan.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <View style={styles.page}>
      <StatusBar style="light" />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== HERO ===== */}
        <SafeAreaView edges={['top']} style={styles.hero}>
          <View style={styles.glowPink} />
          <View style={styles.glowCyan} />

          <Animated.View entering={FadeIn.duration(500)} style={styles.badge}>
            <Ionicons name="school" size={22} color={dark.text} />
            <Text style={styles.badgeText}>SkillBridge</Text>
          </Animated.View>

          <Animated.Text entering={FadeIn.delay(120).duration(500)} style={styles.heroHeadline}>
            SKILLS{'\n'}
            <Text style={{ color: dark.pink }}>FOR HIRE.</Text>
          </Animated.Text>

          <Animated.Text entering={FadeIn.delay(220).duration(500)} style={styles.heroSubtitle}>
            The campus freelancing hub that matches your skills, protects your GPA, and closes your learning
            gaps — automatically.
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(320).duration(500)} style={styles.heroButtons}>
            <GradientButton
              title="Get Started"
              colorsProp={[dark.pink, '#E0106B']}
              onPress={() => router.push('/auth/register')}
              style={{ flex: 1 }}
            />
            <AnimatedPressable
              onPress={() => router.push('/auth/login')}
              style={styles.outlineButton}
            >
              <Text style={styles.outlineButtonText}>Log In</Text>
            </AnimatedPressable>
          </Animated.View>
        </SafeAreaView>

        {/* ===== PILLARS ===== */}
        <View style={styles.section}>
          <ScrollReveal scrollY={scrollY}>
            <Text style={styles.sectionEyebrow}>WHY SKILLBRIDGE</Text>
            <Text style={styles.sectionHeadline}>
              BUILT FOR{'\n'}
              <Text style={{ color: dark.cyan }}>STUDENT LIFE.</Text>
            </Text>
          </ScrollReveal>

          <View style={styles.pillarGrid}>
            {PILLARS.map((p, i) => (
              <ScrollReveal key={p.title} scrollY={scrollY} style={styles.pillarCard} distance={30 + i * 6}>
                <View style={styles.pillarIcon}>
                  <Ionicons name={p.icon} size={20} color={dark.pink} />
                </View>
                <Text style={styles.pillarTitle}>{p.title}</Text>
                <Text style={styles.pillarBody}>{p.body}</Text>
              </ScrollReveal>
            ))}
          </View>
        </View>

        {/* ===== AI GAP DETECTOR CALLOUT ===== */}
        <View style={[styles.section, styles.calloutSection]}>
          <ScrollReveal scrollY={scrollY}>
            <View style={styles.calloutIconRow}>
              <Ionicons name="analytics" size={16} color={dark.cyan} />
              <Text style={styles.calloutEyebrow}>NEW · AI LEARNING GAP DETECTOR</Text>
            </View>
            <Text style={styles.calloutHeadline}>
              KNOW EXACTLY{'\n'}WHERE YOU'RE{'\n'}
              <Text style={{ color: dark.cyan }}>STUCK.</Text>
            </Text>
            <Text style={styles.calloutBody}>
              Take a short diagnostic on a subject. We score your accuracy concept-by-concept, flag the ones
              you're weakest on, and hand you a study plan with practice questions built around exactly those
              gaps. Retest any time and the plan updates itself.
            </Text>
            <View style={styles.calloutSteps}>
              <View style={styles.calloutStep}>
                <Text style={styles.calloutStepNumber}>1</Text>
                <Text style={styles.calloutStepText}>Answer a quick diagnostic quiz</Text>
              </View>
              <View style={styles.calloutStep}>
                <Text style={styles.calloutStepNumber}>2</Text>
                <Text style={styles.calloutStepText}>See your weak concepts, ranked worst-first</Text>
              </View>
              <View style={styles.calloutStep}>
                <Text style={styles.calloutStepNumber}>3</Text>
                <Text style={styles.calloutStepText}>Practice, retest, watch the plan adapt</Text>
              </View>
            </View>
          </ScrollReveal>
        </View>

        {/* ===== HOW IT WORKS ===== */}
        <View style={styles.section}>
          <ScrollReveal scrollY={scrollY}>
            <Text style={styles.sectionEyebrow}>HOW IT WORKS</Text>
            <Text style={styles.sectionHeadline}>
              FOUR STEPS.{'\n'}
              <Text style={{ color: dark.pink }}>ZERO GUESSWORK.</Text>
            </Text>
          </ScrollReveal>

          {STEPS.map((s, i) => (
            <ScrollReveal key={s.number} scrollY={scrollY} style={styles.stepRow} distance={26}>
              <Text style={styles.stepNumber}>{s.number}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
            </ScrollReveal>
          ))}
        </View>

        {/* ===== FINAL CTA ===== */}
        <View style={[styles.section, styles.ctaSection]}>
          <ScrollReveal scrollY={scrollY}>
            <Text style={styles.ctaHeadline}>
              MAKE YOUR{'\n'}
              <Text style={{ color: dark.pink }}>NEXT MOVE.</Text>
            </Text>
            <Text style={styles.ctaSubtitle}>Verified in minutes. Free for students.</Text>
            <GradientButton
              title="Create your account"
              colorsProp={[dark.pink, '#E0106B']}
              onPress={() => router.push('/auth/register')}
              icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollReveal>

          <Text style={styles.footer}>SkillBridge — the campus freelancing hub.</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: dark.bg },
  scrollContent: { paddingBottom: spacing.xl },

  hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, overflow: 'hidden' },
  glowPink: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: dark.pink,
    opacity: 0.16,
  },
  glowCyan: {
    position: 'absolute',
    top: 220,
    left: -100,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: dark.cyan,
    opacity: 0.12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  badgeText: { color: dark.text, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  heroHeadline: {
    fontSize: 56,
    lineHeight: 58,
    fontWeight: '900',
    color: dark.text,
    letterSpacing: -1.5,
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: dark.textMuted,
    marginBottom: spacing.xl,
    maxWidth: 520,
  },
  heroButtons: { flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch' },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.full,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: { color: dark.text, fontWeight: '700', fontSize: 16 },

  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl, borderTopWidth: 1, borderTopColor: dark.border },
  sectionEyebrow: { color: dark.pink, fontSize: 12.5, fontWeight: '800', letterSpacing: 1.5, marginBottom: spacing.sm },
  sectionHeadline: { fontSize: 34, lineHeight: 38, fontWeight: '900', color: dark.text, letterSpacing: -0.8, marginBottom: spacing.xl },

  pillarGrid: { gap: spacing.md },
  pillarCard: { backgroundColor: dark.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: dark.border },
  pillarIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,30,122,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  pillarTitle: { color: dark.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  pillarBody: { color: dark.textMuted, fontSize: 13.5, lineHeight: 19 },

  calloutSection: { backgroundColor: dark.bgAlt },
  calloutIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  calloutEyebrow: { color: dark.cyan, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  calloutHeadline: { fontSize: 34, lineHeight: 38, fontWeight: '900', color: dark.text, letterSpacing: -0.8, marginBottom: spacing.md },
  calloutBody: { color: dark.textMuted, fontSize: 14.5, lineHeight: 22, marginBottom: spacing.xl },
  calloutSteps: { gap: spacing.md },
  calloutStep: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  calloutStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(47,211,255,0.12)',
    color: dark.cyan,
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 32,
    overflow: 'hidden',
  },
  calloutStepText: { flex: 1, color: dark.text, fontSize: 14, fontWeight: '600' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg },
  stepNumber: { color: dark.pink, fontSize: 22, fontWeight: '900', width: 44 },
  stepTitle: { color: dark.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  stepBody: { color: dark.textMuted, fontSize: 13.5, lineHeight: 19 },

  ctaSection: { alignItems: 'flex-start' },
  ctaHeadline: { fontSize: 38, lineHeight: 40, fontWeight: '900', color: dark.text, letterSpacing: -0.9, marginBottom: spacing.sm },
  ctaSubtitle: { color: dark.textMuted, fontSize: 14.5 },
  footer: { color: dark.textMuted, fontSize: 12, marginTop: spacing.xxl },
});
