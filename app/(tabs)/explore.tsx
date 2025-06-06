import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  Animated 
} from 'react-native';
import { Search, Shuffle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useCampusStore } from '@/store/campus-store';
import OrganizationCard from '@/components/OrganizationCard';
import { Organization } from '@/types/campus';
import BackToTopButton from '@/components/BackToTopButton';

export default function ExploreScreen() {
  const { organizations } = useCampusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<Organization[]>(organizations);
  const scrollY = new Animated.Value(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  
  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setResources(organizations);
      return;
    }
    
    const filtered = organizations.filter(org => 
      org.name.toLowerCase().includes(text.toLowerCase()) ||
      org.description.toLowerCase().includes(text.toLowerCase()) ||
      org.type.toLowerCase().includes(text.toLowerCase())
    );
    
    setResources(filtered);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setResources(organizations);
  };
  
  // Randomize resources
  const randomizeResources = () => {
    const shuffled = [...resources].sort(() => Math.random() - 0.5);
    setResources(shuffled);
  };
  
  // Handle card press
  const handleCardPress = (id: string) => {
    router.push(`/organization/${id}`);
  };
  
  // Scroll to top
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  
  // Render item
  const renderItem = ({ item }: { item: Organization }) => (
    <View style={styles.cardWrapper}>
      <OrganizationCard 
        organization={item} 
        onPress={handleCardPress} 
      />
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          Discover resources and opportunities across campus
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.randomizeButton}
          onPress={randomizeResources}
        >
          <Shuffle size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {resources.length} {resources.length === 1 ? 'result' : 'results'}
          </Text>
          {resources.length > 0 && (
            <Text style={styles.randomizeHint}>
              Tap shuffle to randomize
            </Text>
          )}
        </View>
        
        {resources.length > 0 ? (
          <Animated.FlatList
            ref={flatListRef}
            data={resources}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No resources found matching "{searchQuery}"
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={clearSearch}
            >
              <Text style={styles.emptyStateButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <BackToTopButton 
        scrollY={scrollY} 
        onPress={scrollToTop} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
  },
  randomizeButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  randomizeHint: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48.5%',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontWeight: '500',
  },
});