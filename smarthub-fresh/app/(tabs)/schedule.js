import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TextInput, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { scheduleAPI } from '../../services/api';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import GradientButton from '../../components/ui/GradientButton';
import { colors, gradients, radius, spacing, shadow, statusColors } from '../../constants/appTheme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_COPY = {
  normal: { label: 'On track' },
  reduced: { label: 'Reduced capacity' },
  exam_lockdown: { label: 'Exam lockdown' },
};

const TYPE_OPTIONS = [
  { key: 'class', label: 'Class', icon: 'book-outline' },
  { key: 'exam', label: 'Exam', icon: 'document-text-outline' },
  { key: 'assignment', label: 'Assignment', icon: 'clipboard-outline' },
];

export default function ScheduleScreen() {
  const [items, setItems] = useState([]);
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState('class');
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [itemsRes, workloadRes] = await Promise.all([
        scheduleAPI.getSchedule(),
        scheduleAPI.getWorkload(),
      ]);
      setItems(itemsRes.data);
      setWorkload(workloadRes.data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Missing info', 'Please give this a title');
      return;
    }
    if ((type === 'exam' || type === 'assignment') && !dueDate) {
      Alert.alert('Missing info', 'Please enter a due date (YYYY-MM-DD)');
      return;
    }

    try {
      setSaving(true);
      const payload =
        type === 'class'
          ? { type, title, dayOfWeek: parseInt(dayOfWeek, 10), startTime, endTime }
          : { type, title, dueDate };

      await scheduleAPI.addItem(payload);
      setTitle('');
      setDueDate('');
      await load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await scheduleAPI.deleteItem(id);
      await load();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const status = workload ? statusColors[workload.status] || statusColors.normal : null;
  const statusLabel = workload ? (STATUS_COPY[workload.status] || STATUS_COPY.normal).label : '';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      >
        <SafeAreaView edges={['top']} style={styles.header}>
          <Animated.View entering={FadeInDown.duration(450)}>
            <Text style={styles.headerTitle}>Schedule & Workload</Text>
            <Text style={styles.headerSubtitle}>
              Log classes, exams and deadlines — we'll automatically throttle how much freelance work you should take on.
            </Text>
          </Animated.View>
        </SafeAreaView>

        {workload && (
          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <LinearGradient colors={status.gradient} style={styles.workloadCard}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursNumber}>{workload.allowedHoursThisWeek}h / week</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{statusLabel}</Text>
                </View>
              </View>
              {workload.reasons.map((r, i) => (
                <Text key={i} style={styles.reason}>· {r}</Text>
              ))}
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(180).duration(450)} style={styles.formCard}>
          <Text style={styles.formTitle}>Add to your schedule</Text>

          <View style={styles.segmentRow}>
            {TYPE_OPTIONS.map((opt) => {
              const active = type === opt.key;
              return (
                <AnimatedPressable
                  key={opt.key}
                  onPress={() => setType(opt.key)}
                  style={[styles.segment, active && styles.segmentActive]}
                >
                  <Ionicons name={opt.icon} size={15} color={active ? colors.white : colors.textMuted} />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={type === 'class' ? 'e.g. Data Structures Lecture' : 'e.g. DBMS Final'}
            placeholderTextColor={colors.textFaint}
          />

          {type === 'class' ? (
            <>
              <Text style={styles.label}>Day</Text>
              <View style={styles.dayRow}>
                {DAY_LABELS.map((label, i) => {
                  const active = dayOfWeek === String(i);
                  return (
                    <AnimatedPressable
                      key={label}
                      onPress={() => setDayOfWeek(String(i))}
                      style={[styles.dayChip, active && styles.dayChipActive]}
                      haptic={false}
                    >
                      <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{label}</Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Start</Text>
                  <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="09:00" placeholderTextColor={colors.textFaint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>End</Text>
                  <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="10:00" placeholderTextColor={colors.textFaint} />
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="2026-09-20"
                placeholderTextColor={colors.textFaint}
              />
            </>
          )}

          <GradientButton title="Add to schedule" onPress={handleAdd} loading={saving} style={{ marginTop: spacing.sm }} />
        </Animated.View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Your schedule</Text>
          {items.length === 0 && !loading && (
            <Text style={styles.emptyText}>Nothing added yet — your capacity above uses the default cap.</Text>
          )}
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(350)}
              layout={Layout}
              style={styles.itemCard}
            >
              <View style={[styles.itemIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons
                  name={TYPE_OPTIONS.find((t) => t.key === item.type)?.icon || 'calendar-outline'}
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.type === 'class'
                    ? `${DAY_LABELS[item.dayOfWeek]} · ${item.startTime}–${item.endTime}`
                    : `${item.type} · due ${item.dueDate}`}
                </Text>
              </View>
              <AnimatedPressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={17} color={colors.danger} />
              </AnimatedPressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 120 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6, letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  workloadCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.xl, padding: spacing.lg, ...shadow.md },
  hoursRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  hoursNumber: { fontSize: 22, fontWeight: '800', color: colors.white },
  statusPill: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  statusPillText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  reason: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 4 },
  formCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.sm },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  segmentTextActive: { color: colors.white },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    color: colors.text,
    marginBottom: 10,
  },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt },
  dayChipActive: { backgroundColor: colors.primary },
  dayChipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  dayChipTextActive: { color: colors.white },
  timeRow: { flexDirection: 'row', gap: 10 },
  listSection: { paddingHorizontal: spacing.lg },
  listTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  emptyText: { color: colors.textFaint, fontSize: 13 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 8,
    ...shadow.sm,
  },
  itemIcon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  deleteButton: { padding: 6 },
});
