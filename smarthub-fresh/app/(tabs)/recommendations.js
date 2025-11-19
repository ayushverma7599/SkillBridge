import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../services/api';

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
    if (score >= 70) return '#4CAF50';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  const renderProject = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.matchContainer}>
        <Text style={[styles.matchText, { color: getMatchColor(item.matchScore) }]}>
          {item.matchScore}% Match
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.matchScore}%`, backgroundColor: getMatchColor(item.matchScore) }]} />
        </View>
      </View>

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

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push(`/project/${item.id}`)}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AI-Powered Recommendations</Text>
        <Text style={styles.subheader}>
          Projects matched to your skills & experience
        </Text>
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRecommendations} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No recommendations available</Text>
            <Text style={styles.emptySubtext}>
              Complete your profile to get better matches
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#007AFF' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subheader: { color: '#fff', marginTop: 5 },
  card: { margin: 10, padding: 15, backgroundColor: '#fff', borderRadius: 10, elevation: 3 },
  matchContainer: { marginBottom: 15 },
  matchText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  description: { color: '#666', marginBottom: 10 },
  metaContainer: { flexDirection: 'row', marginBottom: 10 },
  chip: { backgroundColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  chipText: { fontSize: 12 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 },
  emptySubtext: { color: '#999', marginTop: 10 },
});
