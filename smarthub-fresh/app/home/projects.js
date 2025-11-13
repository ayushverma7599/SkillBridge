import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, Button, Searchbar, Chip } from 'react-native-paper';
import { projectAPI } from '../../services/api';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [search, selectedCategory]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAllProjects({
        search: search || undefined,
        category: selectedCategory || undefined,
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProject = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectDesc}>{item.description}</Text>
        <View style={styles.chipRow}>
          <Chip>{`₹${item.budget}`}</Chip>
          <Chip>{item.category}</Chip>
        </View>
        <Button mode="contained" style={styles.applyBtn}>
          Apply Now
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search projects..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />

      <View style={styles.filterRow}>
        {['Web', 'Mobile', 'Design'].map((cat) => (
          <Chip
            key={cat}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            style={styles.filterChip}
          >
            {cat}
          </Chip>
        ))}
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProjects} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  searchbar: { marginBottom: 15 },
  filterRow: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  filterChip: { flex: 1 },
  card: { marginBottom: 15 },
  projectTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  projectDesc: { color: '#666', marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  applyBtn: { marginTop: 10 },
});
