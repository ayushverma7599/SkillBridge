import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Chip, Button, Text, Menu, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.X:5000/api/v1';

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'createdAt'
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [filters, page]);

  const loadProjects = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('token');
      
      const params = {
        search,
        ...filters,
        page,
        limit: 10
      };

      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

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

  const renderProject = ({ item }) => (
    <Card style={styles.card} onPress={() => router.push(`/project/${item.id}`)}>
      <Card.Content>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.metaContainer}>
          <Chip style={styles.chip} textStyle={styles.chipText}>
            ₹{item.budget}
          </Chip>
          <Chip style={styles.chip} textStyle={styles.chipText}>
            {item.category}
          </Chip>
        </View>

        <View style={styles.footer}>
          <Text style={styles.author}>by {item.freelancer?.fullName}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search projects..."
          onChangeText={setSearch}
          value={search}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
        />
        
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button onPress={() => setMenuVisible(true)} icon="filter">
              Filters
            </Button>
          }
        >
          <Menu.Item 
            onPress={() => {
              setFilters({ ...filters, sortBy: 'createdAt' });
              setMenuVisible(false);
            }} 
            title="Sort: Latest" 
          />
          <Menu.Item 
            onPress={() => {
              setFilters({ ...filters, sortBy: 'budget' });
              setMenuVisible(false);
            }} 
            title="Sort: Budget" 
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              setFilters({ ...filters, category: 'web-development' });
              setMenuVisible(false);
            }} 
            title="Web Development" 
          />
          <Menu.Item 
            onPress={() => {
              setFilters({ ...filters, category: 'mobile-development' });
              setMenuVisible(false);
            }} 
            title="Mobile Development" 
          />
          <Menu.Item 
            onPress={() => {
              setFilters({ ...filters, category: 'design' });
              setMenuVisible(false);
            }} 
            title="Design" 
          />
        </Menu>
      </View>

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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No projects found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  searchbar: {
    flex: 1,
    marginRight: 10
  },
  card: {
    margin: 10,
    elevation: 2
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  description: {
    color: '#666',
    marginBottom: 10
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 10
  },
  chip: {
    marginRight: 5
  },
  chipText: {
    fontSize: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  author: {
    color: '#007AFF',
    fontSize: 12
  },
  date: {
    color: '#999',
    fontSize: 12
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50
  }
});
