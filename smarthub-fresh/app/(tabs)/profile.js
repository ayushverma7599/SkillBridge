import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TextInput,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../services/api';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import GradientButton from '../../components/ui/GradientButton';
import { colors, gradients, radius, spacing, shadow } from '../../constants/appTheme';

// Older saved profiles may have `skills` stored as a JSON-encoded string
// (a since-fixed backend bug double-encoded it) instead of an array —
// normalize whatever comes back so the UI never crashes on it.
function normalizeSkills(skills) {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    bio: '',
    skills: [],
    university: '',
    course: '',
    year: '',
    avatar: null,
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/profile');
      const data = response.data;

      setProfile({
        ...data,
        skills: normalizeSkills(data.skills),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await apiClient.put('/profile', profile);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      });

      const response = await apiClient.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile({ ...profile, avatar: response.data.avatar });
      Alert.alert('Success', 'Avatar uploaded');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
      console.error('Upload avatar error:', error);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradients.hero} style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <Animated.View entering={FadeInDown.duration(450)} style={styles.avatarContainer}>
              <AnimatedPressable onPress={pickImage} style={styles.avatarWrap}>
                {profile.avatar ? (
                  <Image
                    source={{ uri: `${process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}${profile.avatar}` }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={13} color={colors.white} />
                </View>
              </AnimatedPressable>
              <Text style={styles.nameText}>{profile.fullName || 'Your name'}</Text>
              <Text style={styles.emailText}>{profile.email}</Text>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.card}>
          <Text style={styles.sectionTitle}>Basic info</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profile.fullName}
            onChangeText={(text) => setProfile({ ...profile, fullName: text })}
            placeholderTextColor={colors.textFaint}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell people about yourself"
            value={profile.bio}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textFaint}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>University</Text>
              <TextInput
                style={styles.input}
                value={profile.university}
                onChangeText={(text) => setProfile({ ...profile, university: text })}
                placeholderTextColor={colors.textFaint}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={profile.year}
                onChangeText={(text) => setProfile({ ...profile, year: text })}
                keyboardType="numeric"
                placeholderTextColor={colors.textFaint}
              />
            </View>
          </View>

          <Text style={styles.label}>Course</Text>
          <TextInput
            style={styles.input}
            value={profile.course}
            onChangeText={(text) => setProfile({ ...profile, course: text })}
            placeholderTextColor={colors.textFaint}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(230).duration(450)} style={styles.card}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillInputRow}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="Add a skill"
              placeholderTextColor={colors.textFaint}
              onSubmitEditing={addSkill}
            />
            <AnimatedPressable style={styles.addSkillButton} onPress={addSkill}>
              <Ionicons name="add" size={20} color={colors.white} />
            </AnimatedPressable>
          </View>

          <View style={styles.skillsContainer}>
            {profile.skills.map((skill, index) => (
              <Animated.View key={skill} entering={FadeIn.delay(index * 40)} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
                <AnimatedPressable onPress={() => removeSkill(skill)} haptic={false}>
                  <Ionicons name="close" size={14} color={colors.textMuted} />
                </AnimatedPressable>
              </Animated.View>
            ))}
            {profile.skills.length === 0 && (
              <Text style={styles.emptySkills}>No skills added yet</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={styles.footer}>
          <GradientButton title="Save changes" onPress={handleUpdate} loading={loading} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 120 },
  hero: { paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  avatarContainer: { alignItems: 'center', paddingTop: spacing.sm },
  avatarWrap: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 36, color: colors.white, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  nameText: { fontSize: 18, fontWeight: '800', color: colors.white, marginTop: 12 },
  emailText: { fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...shadow.sm,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    color: colors.text,
    marginBottom: 12,
  },
  textArea: { height: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  skillInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  skillInput: { flex: 1, marginBottom: 0 },
  addSkillButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  chipText: { color: colors.primaryDark, fontSize: 12.5, fontWeight: '600' },
  emptySkills: { color: colors.textFaint, fontSize: 13 },
  footer: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
});
