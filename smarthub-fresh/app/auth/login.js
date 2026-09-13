import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { authAPI, storage } from '../../services/api';
import GradientButton from '../../components/ui/GradientButton';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import { colors, gradients, radius, spacing, shadow } from '../../constants/appTheme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // react-native-web does not reliably render Alert.alert() — on web it's a
  // no-op (or console-only) rather than an actual dialog, so an error there
  // looked exactly like "nothing happens" when login failed. Errors are
  // rendered inline instead so they're visible on every platform.
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });

      if (response.data && response.data.token) {
        await storage.setItem('token', response.data.token);
      }

      if (response.data && response.data.user) {
        await storage.setItem('user', JSON.stringify(response.data.user));
      }

      router.replace('/(tabs)');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      setErrorMsg(errorMessage);
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.heroBadge}>
            <Ionicons name="school" size={26} color={colors.white} />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.heroTitle}>
            Welcome back
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(180).duration(500)} style={styles.heroSubtitle}>
            Sign in to keep browsing campus-verified work
          </Animated.Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
            {!!errorMsg && (
              <Animated.View entering={FadeIn} style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </Animated.View>
            )}

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.textFaint} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@college.edu"
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.textFaint}
              />
              <AnimatedPressable onPress={() => setShowPassword((s) => !s)} haptic={false} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textFaint} />
              </AnimatedPressable>
            </View>

            <GradientButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: spacing.md }}
            />

            <AnimatedPressable onPress={() => router.push('/auth/register')} haptic={false} style={styles.linkWrap}>
              <Text style={styles.registerLink}>
                Don't have an account? <Text style={styles.registerLinkBold}>Register</Text>
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
  hero: { paddingTop: spacing.lg, paddingBottom: 64, paddingHorizontal: spacing.xl },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.white, marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.lg, marginTop: -spacing.lg },
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
  eyeButton: { padding: 6 },
  linkWrap: { marginTop: spacing.lg, alignItems: 'center', paddingBottom: spacing.sm },
  registerLink: { color: colors.textMuted, fontSize: 13.5 },
  registerLinkBold: { color: colors.primary, fontWeight: '700' },
});
