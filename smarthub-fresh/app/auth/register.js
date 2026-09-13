// frontend/app/auth/register.js

import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { authAPI, storage, collegeAPI } from '../../services/api';
import GradientButton from '../../components/ui/GradientButton';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import { colors, gradients, radius, spacing, shadow } from '../../constants/appTheme';

const USER_TYPES = [
  { label: 'Student', value: 'student', icon: 'school-outline' },
  { label: 'Freelancer', value: 'freelancer', icon: 'briefcase-outline' },
];

export default function RegisterScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
  });

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Just used to show the student which campus domains are already
    // recognised — registration itself still works with any email.
    collegeAPI.list().then((res) => setColleges(res.data)).catch(() => {});
  }, []);

  const handleRegister = async () => {
    setErrorMsg('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
      });

      const { token, user } = response.data;
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user));

      router.replace('/(tabs)');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <AnimatedPressable onPress={() => router.back()} haptic={false} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </AnimatedPressable>
          <Animated.Text entering={FadeInDown.delay(80).duration(500)} style={styles.heroTitle}>
            Create account
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(160).duration(500)} style={styles.heroSubtitle}>
            Join your campus's freelance community
          </Animated.Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
            {!!errorMsg && (
              <Animated.View entering={FadeIn} style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </Animated.View>
            )}

            {colleges.length > 0 && (
              <View style={styles.hintBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.hint}>
                  Use your college email ({colleges.map((c) => c.domain).join(', ')}) to get auto-verified.
                </Text>
              </View>
            )}

            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={colors.textFaint} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholderTextColor={colors.textFaint}
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.textFaint} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@college.edu"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textFaint}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textFaint} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                placeholderTextColor={colors.textFaint}
              />
            </View>

            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textFaint} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry
                placeholderTextColor={colors.textFaint}
              />
            </View>

            <Text style={styles.label}>I am a</Text>
            <View style={styles.typeRow}>
              {USER_TYPES.map((opt) => {
                const active = formData.userType === opt.value;
                return (
                  <AnimatedPressable
                    key={opt.value}
                    onPress={() => setFormData({ ...formData, userType: opt.value })}
                    style={[styles.typeOption, active && styles.typeOptionActive]}
                  >
                    <Ionicons name={opt.icon} size={18} color={active ? colors.white : colors.textMuted} />
                    <Text style={[styles.typeOptionText, active && styles.typeOptionTextActive]}>{opt.label}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            <GradientButton
              title="Register"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: spacing.md }}
            />

            <AnimatedPressable onPress={() => router.back()} haptic={false} style={styles.linkWrap}>
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkBold}>Login</Text>
              </Text>
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingTop: spacing.lg, paddingBottom: 56, paddingHorizontal: spacing.xl },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: colors.white, marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, marginTop: -spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: spacing.md,
  },
  hint: { fontSize: 12, color: colors.primaryDark, flex: 1, lineHeight: 17 },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted, marginBottom: 6, marginTop: spacing.sm },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15.5, color: colors.text },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: { fontSize: 13.5, fontWeight: '600', color: colors.textMuted },
  typeOptionTextActive: { color: colors.white },
  linkWrap: { marginTop: spacing.lg, alignItems: 'center' },
  link: { color: colors.textMuted, fontSize: 13.5 },
  linkBold: { color: colors.primary, fontWeight: '700' },
});
