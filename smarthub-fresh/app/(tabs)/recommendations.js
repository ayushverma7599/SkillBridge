import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import apiClient from '../../services/api';
import AnimatedPressable from '../../components/ui/AnimatedPressable';
import AnimatedProgressBar from '../../components/ui/AnimatedProgressBar';
import GradientButton from '../../components/ui/GradientButton';
import { colors, gradients, radius, spacing, shadow } from '../../constants/appTheme';

export default function RecommendationsScreen() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/recommendations');
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 70) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.danger;
  };

  const renderProject = ({ item, index }) => {
    const matchColor = getMatchColor(item.matchScore);
    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 70).duration(420)} style={styles.card}>
        <View style={styles.matchRow}>
          <View style={[styles.matchBadge, { backgroundColor: `${matchColor}1A` }]}>
            <Ionicons name="sparkles" size={12} color={matchColor} />
            <Text style={[styles.matchText, { color: matchColor }]}>{item.matchScore}% Match</Text>
          </View>
        </View>
        <AnimatedProgressBar progress={item.matchScore} color={matchColor} delay={index * 80} style={{ marginBottom: 14 }} />

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>₹{item.budget}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.category}</Text>
          </View>
        </View>

        <GradientButton
          title="View Details"
          colorsProp={gradients.primary}
          onPress={() => router.push(`/project/${item.id}`)}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.hero} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTop}>
            <Ionicons name="sparkles" size={20} color={colors.white} />
            <Text style={styles.headerText}>For You</Text>
          </View>
          <Text style={styles.subheader}>AI-matched to your skills & experience</Text>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={recommendations}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRecommendations} tintColor={colors.primary} />}
        ListEmptyComponent={
          <Animated.View entering={FadeIn} style={styles.empty}>
            <Ionicons name="sparkles-outline" size={40} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>Complete your profile to get better matches</Text>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerText: { fontSize: 24, fontWeight: '800', color: colors.white, letterSpacing: -0.4 },
  subheader: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5 },
  listContent: { padding: spacing.md, paddingTop: spacing.lg, marginTop: -spacing.md, paddingBottom: 120 },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.xl, marginBottom: spacing.md, ...shadow.md },
  matchRow: { marginBottom: 10 },
  matchBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  matchText: { fontSize: 12.5, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 5 },
  description: { color: colors.textMuted, fontSize: 13.5, lineHeight: 19, marginBottom: 12 },
  metaContainer: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 60, gap: 8 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  emptySubtext: { color: colors.textMuted, fontSize: 13 },
});
