import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Animated, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Shuffle, X } from 'lucide-react-native';
import FilterTabs from '@/components/FilterTabs';
import OrganizationCard from '@/components/OrganizationCard';
import TodayEvents from '@/components/TodayEvents';
import { useCampusStore } from '@/store/campus-store';
import { useEventsStore } from '@/store/events-store';
import { useUserStore } from '@/store/user-store';
import Colors from '@/constants/colors';
import BackToTopButton from '@/components/BackToTopButton';
import Logo from '@/components/Logo';

export default function HomeScreen() {
  const router = useRouter();
  const { filteredOrganizations, organizations, setSelectedFilter } = useCampusStore();
  const { todayEvents } = useEventsStore();
  const { userProfile } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(filteredOrganizations);
  const [isSearching, setIsSearching] = useState(false);
  const scrollY = new Animated.Value(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const recommendationsSectionRef = useRef<View>(null);

  const handleCardPress = (id: string) => {
    router.push(`/organization/${id}`);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(text.length > 0);
    
    if (text.trim() === '') {
      setSearchResults(filteredOrganizations);
      return;
    }
    
    const filtered = organizations.filter(org => 
      org.name.toLowerCase().includes(text.toLowerCase()) ||
      org.description.toLowerCase().includes(text.toLowerCase()) ||
      org.type.toLowerCase().includes(text.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults(filteredOrganizations);
  };

  const randomizeResults = () => {
    const shuffled = [...searchResults].sort(() => Math.random() - 0.5);
    setSearchResults(shuffled);
  };

  // Update search results when filtered organizations change
  React.useEffect(() => {
    if (!isSearching) {
      setSearchResults(filteredOrganizations);
    }
  }, [filteredOrganizations, isSearching]);
  
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToRecommendations = () => {
    recommendationsSectionRef.current?.measureLayout(
      scrollViewRef.current?.getInnerViewNode(),
      (x, y) => {
        scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
      },
      () => {}
    );
  };

  const displayedOrganizations = isSearching ? searchResults : filteredOrganizations;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.heroSection}>
          <View style={styles.titleContainer}>
            <View style={styles.welcomeContainer}>
              <Logo size={24} />
              <Text style={styles.welcomeText}>
                Hi, {userProfile?.name?.split(' ')[0] || 'there'}!
              </Text>
            </View>
            <Text style={styles.title}>
              Recommendations <Text style={styles.titleAmp}>&</Text>
              {" "}
              <Text style={styles.titleHighlight}>Opportunities</Text>
            </Text>
            <Text style={styles.subtitle}>
              Discover personalized recommendations tailored to your academic journey
            </Text>
          </View>
        </View>
        
        {/* Today's Top 3 Events Section */}
        <TodayEvents 
          events={todayEvents.slice(0, 3)} 
          onSeeAllPress={scrollToRecommendations}
        />
        
        <View ref={recommendationsSectionRef} style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>
            {isSearching ? 'Search Results' : 'Recommended Organizations'}
          </Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search organizations..."
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
              onPress={randomizeResults}
            >
              <Shuffle size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs - only show when not searching */}
          {!isSearching && <FilterTabs />}
          
          {/* Results Count */}
          {isSearching && (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {displayedOrganizations.length} {displayedOrganizations.length === 1 ? 'result' : 'results'}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          {displayedOrganizations.length > 0 ? (
            <View style={styles.gridContainer}>
              {displayedOrganizations.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  <OrganizationCard 
                    organization={item} 
                    onPress={handleCardPress} 
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {isSearching 
                  ? `No organizations found matching "${searchQuery}"`
                  : 'No recommendations found for this filter.'
                }
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={isSearching ? clearSearch : () => setSelectedFilter('all')}
              >
                <Text style={styles.emptyStateButtonText}>
                  {isSearching ? 'Clear Search' : 'View All'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
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
  heroSection: {
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    marginBottom: 16,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 36,
  },
  titleAmp: {
    color: Colors.text,
  },
  titleHighlight: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
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
  resultsHeader: {
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  cardWrapper: {
    width: '48.5%',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
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