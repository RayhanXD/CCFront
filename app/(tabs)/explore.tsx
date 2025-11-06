import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Animated 
} from 'react-native';
import { Search, Shuffle, X } from 'lucide-react-native';
import CustomStatusBar from '@/components/CustomStatusBar';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useOrganizations } from '@/hooks/useApiData';
import OrganizationCard from '@/components/OrganizationCard';
import { Organization } from '@/types/campus';
import BackToTopButton from '@/components/BackToTopButton';
import { useTheme } from '@/contexts/theme-context';
import ThemedText from '@/components/ThemedText';

export default React.memo(function ExploreScreen() {
  // Use API hook to fetch organizations data
  const { data: orgsData, loading: orgsLoading, error: orgsError } = useOrganizations();
  const organizations = orgsData?.organizations || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<Organization[]>(organizations);
  // Use useRef for values that shouldn't trigger re-renders
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  
  // Debug: Log API status
  useEffect(() => {
    if (__DEV__) {
      console.log('🔍 Explore Screen API Status:', {
        loading: orgsLoading,
        error: orgsError,
        count: organizations.length,
        resourcesCount: resources.length,
        searchQuery: searchQuery || 'none'
      });
    }
  }, [orgsLoading, orgsError, organizations.length, resources.length, searchQuery]);
  
  // Update resources when organizations data or search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResources(organizations);
    } else {
      const filtered = organizations.filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResources(filtered);
    }
  }, [organizations, searchQuery]);
  
  // Memoize the search function - just update query, useEffect handles filtering
  const handleSearch = React.useCallback((text: string) => {
    setSearchQuery(text);
  }, []);
  
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <ThemedText variant="h1" weight="bold" style={styles.title}>
          Explore
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.subtitle}>
          Discover resources and opportunities across campus
        </ThemedText>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer, 
          { 
            backgroundColor: theme.inputBackground, 
            borderColor: theme.border 
          }
        ]}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={theme.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={theme.textSecondary} strokeWidth={isDarkMode ? 2.5 : 2} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.randomizeButton, { backgroundColor: theme.primary }]}
          onPress={randomizeResources}
        >
          <Shuffle size={20} color={theme.white} strokeWidth={isDarkMode ? 2.5 : 2} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.resultsCount}>
            {orgsLoading ? 'Loading...' : `${resources.length} ${resources.length === 1 ? 'result' : 'results'}`}
          </ThemedText>
          {orgsError && (
            <ThemedText variant="bodySmall" color="error" style={styles.errorText}>
              Using mock data
            </ThemedText>
          )}
          {resources.length > 0 && !orgsLoading && (
            <ThemedText variant="bodySmall" color="secondary" style={styles.randomizeHint}>
              Tap shuffle to randomize
            </ThemedText>
          )}
        </View>
        
        {orgsLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedText variant="body" color="secondary">
              Loading organizations...
            </ThemedText>
          </View>
        ) : resources.length > 0 ? (
          <Animated.FlatList
            ref={flatListRef}
            data={resources}
            keyExtractor={(item, index) => `${item.id}-${index}`}
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
            <ThemedText variant="body" color="secondary" style={styles.emptyStateText}>
              No resources found matching "{searchQuery}"
            </ThemedText>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
              onPress={clearSearch}
            >
              <ThemedText variant="button" color="inverted" style={styles.emptyStateButtonText}>
                Clear Search
              </ThemedText>
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  randomizeButton: {
    width: 48,
    height: 48,
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
  },
  randomizeHint: {
    fontSize: 14,
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
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  emptyStateButtonText: {
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 8,
  },
});