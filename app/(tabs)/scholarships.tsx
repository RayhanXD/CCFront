import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import CustomStatusBar from '@/components/CustomStatusBar';
import { useRouter } from 'expo-router';
import ScholarshipFilterTabs from '@/components/ScholarshipFilterTabs';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { useScholarshipStore } from '@/store/scholarship-store';
import { useTheme } from '@/contexts/theme-context';
import BackToTopButton from '@/components/BackToTopButton';
import { useDialog } from '@/contexts/dialog-context';
import ThemedText from '@/components/ThemedText';

export default React.memo(function ScholarshipsScreen() {
  const router = useRouter();
  const { selectedFilter, setSelectedFilter } = useScholarshipStore();
  const filteredScholarships = useScholarshipStore(state => state.getFilteredScholarships());
  const { showError } = useDialog();
  const { theme, isDarkMode } = useTheme();
  // Use useRef for values that shouldn't trigger re-renders
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Use a ref to track if we've shown the error
  const hasShownErrorRef = useRef(false);
  
  // Check if there are no scholarships for the selected filter
  useEffect(() => {
    // Only show error once per filter change and only if we have no results
    if (filteredScholarships.length === 0 && selectedFilter !== 'all' && !hasShownErrorRef.current) {
      hasShownErrorRef.current = true;
      
      // Use setTimeout to break the update cycle
      setTimeout(() => {
        showError({
          title: 'No Scholarships Found',
          message: `There are no scholarships available for the ${selectedFilter} filter. Would you like to view all scholarships?`,
          buttonText: 'View All',
          buttonAction: () => setSelectedFilter('all')
        });
      }, 100);
    } else if (filteredScholarships.length > 0 || selectedFilter === 'all') {
      // Reset the flag when we have results or switch to 'all'
      hasShownErrorRef.current = false;
    }
  }, [selectedFilter, filteredScholarships.length]);


  const handleCardPress = (id: string) => {
    router.push(`/scholarship/${id}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardWrapper}>
      <ScholarshipCard 
        scholarship={item} 
        onPress={handleCardPress} 
      />
    </View>
  );
  
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Memoize the render function to prevent unnecessary re-renders
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar />
      
      <View style={[styles.heroSection, { backgroundColor: theme.background }]}>
        <View style={styles.titleContainer}>
          <ThemedText variant="h1" weight="bold" style={styles.title}>
            Financial <ThemedText variant="h1" weight="bold" color="accent">Opportunities</ThemedText>
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.subtitle}>
            Discover scholarships and grants that match your academic profile
          </ThemedText>
        </View>
      </View>
      
      <ScholarshipFilterTabs />
      
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      
      {filteredScholarships.length > 0 ? (
        <Animated.FlatList
          ref={flatListRef}
          data={filteredScholarships}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
          <ThemedText variant="body" color="secondary" style={styles.emptyStateText}>
            No scholarships found for the {selectedFilter} filter.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
            onPress={() => useScholarshipStore.getState().setSelectedFilter('all')}
          >
            <ThemedText variant="button" color="inverted" style={styles.emptyStateButtonText}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
      
      <BackToTopButton 
        scrollY={scrollY} 
        onPress={scrollToTop} 
      />
    </SafeAreaView>
  );
});

// Import Colors for backward compatibility
import Colors from '@/constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  cardWrapper: {
    width: '48.5%',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 12,
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
});