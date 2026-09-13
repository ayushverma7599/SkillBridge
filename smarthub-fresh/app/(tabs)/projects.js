import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { projectAPI } from '../../services/api';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import { colors, radius, spacing, shadow } from '../../constants/appTheme';

const SORT_OPTIONS = [
  { key: 'createdAt', label: 'Latest' },
  { key: 'budget', label: 'Budget' },
];

const CATEGORY_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'web-development', label: 'Web Dev' },
  { key: 'mobile-development', label: 'Mobile' },
  { key: 'design', label: 'Design' },
];

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'createdAt',
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [filters, page]);

  const loadProjects = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const params = { search, ...filters, page, limit: 10 };
      const response = await projectAPI.getAllProjects(params);
      const { projects: newProjects, pagination } = response.data;

      if (page === 1) {
        setProjects(newProjects);
      } else {
        setProjects([...projects, ...newProjects]);
      }

      setHasMore(pagination.page < pagination.totalPages);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setProjects([]);
    loadProjects();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(page + 1);
    }
  };

  const renderProject = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 60).duration(400)} layout={Layout}>
      <AnimatedPressable style={styles.card} onPress={() => router.push(`/project/${item.id}`)}>
        <View style={styles.cardTopRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.budgetChip}>
            <Text style={styles.budgetChipText}>₹{item.budget}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.chip}>
            <Ionicons name="pricetag-outline" size={11} color={colors.textMuted} />
            <Text style={styles.chipText}>{item.category}</Text>
          </View>
          {item.college && (
            <View style={[styles.chip, styles.collegeChip]}>
              <Ionicons name="school-outline" size={11} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.primary }]}>{item.college.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.author}>by {item.freelancer?.fullName}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.textFaint} style={{ marginLeft: 14 }} />
          <TextInput
            placeholder="Search projects..."
            onChangeText={setSearch}
            value={search}
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
            placeholderTextColor={colors.textFaint}
            returnKeyType="search"
          />
        </View>

        <View style={styles.filterRow}>
          {CATEGORY_OPTIONS.map((opt) => {
            const active = filters.category === opt.key;
            return (
              <AnimatedPressable
                key={opt.key || 'all'}
                onPress={() => setFilters({ ...filters, category: opt.key })}
                style={[styles.filterChip, active && styles.filterChipActive]}
                haptic={false}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{opt.label}</Text>
              </AnimatedPressable>
            );
          })}
          <View style={styles.filterDivider} />
          {SORT_OPTIONS.map((opt) => {
            const active = filters.sortBy === opt.key;
            return (
              <AnimatedPressable
                key={opt.key}
                onPress={() => setFilters({ ...filters, sortBy: opt.key })}
                style={[styles.filterChip, active && styles.filterChipActiveAlt]}
                haptic={false}
              >
                <Ionicons name="swap-vertical" size={12} color={active ? colors.white : colors.textMuted} />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{opt.label}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </SafeAreaView>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={() => {
          setPage(1);
          loadProjects();
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={FadeIn} style={styles.empty}>
            <Ionicons name="file-tray-outline" size={40} color={colors.textFaint} />
            <Text style={styles.emptyText}>No projects found</Text>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, ...shadow.sm },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.md, letterSpacing: -0.4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: 11, paddingHorizontal: 10, fontSize: 14.5, color: colors.text },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipActiveAlt: { backgroundColor: colors.text },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  filterChipTextActive: { color: colors.white },
  filterDivider: { width: 1, height: 16, backgroundColor: colors.border, marginHorizontal: 2 },
  listContent: { padding: spacing.md, paddingBottom: 120 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  budgetChip: { backgroundColor: colors.successSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  budgetChipText: { color: colors.success, fontWeight: '700', fontSize: 12.5 },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  collegeChip: { backgroundColor: colors.primarySoft },
  chipText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  author: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  date: { color: colors.textFaint, fontSize: 12 },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 60, gap: 10 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
});
