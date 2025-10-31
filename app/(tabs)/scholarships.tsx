import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import CustomStatusBar from '@/components/CustomStatusBar';
import { useRouter } from 'expo-router';
import ScholarshipFilterTabs from '@/components/ScholarshipFilterTabs';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { useScholarshipStore } from '@/store/scholarship-store';
import { useTheme } from '@/contexts/theme-context';
import BackToTopButton from '@/components/BackToTopButton';
import { useDialog } from '@/context/DialogContext';

export default function ScholarshipsScreen() {
  const router = useRouter();
  const { filteredScholarships, selectedFilter, setSelectedFilter } = useScholarshipStore();
  const { showError } = useDialog();
  const { theme, isDarkMode } = useTheme();
  const scrollY = new Animated.Value(0);
  const flatListRef = useRef<FlatList>(null);

  // Check if there are no scholarships for the selected filter
  useEffect(() => {
    if (filteredScholarships.length === 0 && selectedFilter !== 'all') {
      showError({
        title: 'No Scholarships Found',
        message: `There are no scholarships available for the ${selectedFilter} filter. Would you like to view all scholarships?`,
        buttonText: 'View All',
        buttonAction: () => setSelectedFilter('all')
      });
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar />
      
      <View style={[styles.heroSection, { backgroundColor: theme.background }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            Financial <Text style={[styles.titleHighlight, { color: theme.primary }]}>Opportunities</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Discover scholarships and grants that match your academic profile
          </Text>
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
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            No scholarships found for the {selectedFilter} filter.
          </Text>
          <TouchableOpacity 
            style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
            onPress={() => useScholarshipStore.getState().setSelectedFilter('all')}
          >
            <Text style={[styles.emptyStateButtonText, { color: theme.textInverted }]}>View All</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <BackToTopButton 
        scrollY={scrollY} 
        onPress={scrollToTop} 
      />
    </SafeAreaView>
  );
}

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
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 36,
  },
  titleHighlight: {
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