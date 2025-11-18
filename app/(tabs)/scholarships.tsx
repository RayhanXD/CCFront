import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import CustomStatusBar from '@/components/CustomStatusBar';
import ScholarshipFilterTabs from '@/components/ScholarshipFilterTabs';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { useScholarshipStore } from '@/store/scholarship-store';
import { useTheme } from '@/contexts/theme-context';
import BackToTopButton from '@/components/BackToTopButton';
import { useDialog } from '@/contexts/dialog-context';
import ThemedText from '@/components/ThemedText';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default React.memo(function ScholarshipsScreen() {
  const router = useRouter();
  const { 
    selectedFilter, 
    setSelectedFilter, 
    getFilteredScholarships, 
    fetchScholarships,
    refreshScholarships,
    isLoading,
    isRefreshing,
    error: scholarshipError,
    clearError,
  } = useScholarshipStore();
  
  const filteredScholarships = useMemo(() => {
    console.log('📚 useMemo triggered - recalculating filtered scholarships');
    const scholarships = getFilteredScholarships();
    console.log('📚 Filtered scholarships:', scholarships.length, 'items for filter:', selectedFilter);
    console.log('📚 Loading state:', isLoading, 'Error:', scholarshipError);
    console.log('📚 Sample filtered scholarship:', scholarships[0]?.name || 'None');
    return scholarships;
  }, [getFilteredScholarships, selectedFilter, isLoading, scholarshipError]);
  const { showError } = useDialog();
  const { theme } = useTheme();

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const hasShownErrorRef = useRef(false);

  // Fetch scholarships on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📚 Scholarship screen focused - fetching scholarships');
      fetchScholarships();
    }, [fetchScholarships])
  );

  // Also fetch on initial mount
  useEffect(() => {
    console.log('📚 Scholarship screen mounted - initial fetch');
    fetchScholarships();
  }, [fetchScholarships]);

  // Handle API errors
  useEffect(() => {
    if (scholarshipError && !hasShownErrorRef.current) {
      hasShownErrorRef.current = true;
      showError({
        title: 'Error Loading Scholarships',
        message: scholarshipError,
        buttonText: 'Retry',
        buttonAction: () => {
          clearError();
          refreshScholarships();
          hasShownErrorRef.current = false;
        },
      });
    }
  }, [scholarshipError, showError, refreshScholarships, clearError]);

  // Handle empty state for filters
  useEffect(() => {
    if (
      !isLoading &&
      filteredScholarships.length === 0 &&
      selectedFilter !== 'all' &&
      !hasShownErrorRef.current &&
      !scholarshipError
    ) {
      hasShownErrorRef.current = true;

      const timer = setTimeout(() => {
        showError({
          title: 'No Scholarships Found',
          message: `There are no scholarships available for the ${selectedFilter} filter. Would you like to view all scholarships?`,
          buttonText: 'View All',
          buttonAction: () => {
            setSelectedFilter('all');
            hasShownErrorRef.current = false;
          },
        });
      }, 100);

      return () => clearTimeout(timer);
    }

    if (filteredScholarships.length > 0 || selectedFilter === 'all') {
      hasShownErrorRef.current = false;
    }
  }, [filteredScholarships.length, selectedFilter, setSelectedFilter, showError, isLoading, scholarshipError]);

  const handleCardPress = useCallback(
    (id: string) => {
      router.push(`/scholarship/${id}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.cardWrapper}>
        <ScholarshipCard scholarship={item} onPress={handleCardPress} />
      </View>
    ),
    [handleCardPress],
  );

  const onRefresh = useCallback(() => {
    refreshScholarships();
  }, [refreshScholarships]);

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar />

      <View style={[styles.heroSection, { backgroundColor: theme.background }]}>
        <View style={styles.titleContainer}>
          <ThemedText variant="h1" weight="bold" style={styles.title}>
            Financial{' '}
            <ThemedText variant="h1" weight="bold" color="accent">
              Opportunities
            </ThemedText>
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.subtitle}>
            Discover scholarships and grants that match your academic profile
          </ThemedText>
        </View>
      </View>

      <ScholarshipFilterTabs />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {isLoading && filteredScholarships.length === 0 ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText variant="body" color="secondary" style={styles.loadingText}>
            Loading scholarships...
          </ThemedText>
        </View>
      ) : filteredScholarships.length > 0 ? (
        <AnimatedFlatList
          ref={flatListRef}
          data={filteredScholarships}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
        />
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
          <ThemedText variant="body" color="secondary" style={styles.emptyStateText}>
            {scholarshipError 
              ? 'Unable to load scholarships. Please try again.'
              : `No scholarships found for the ${selectedFilter} filter.`
            }
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              if (scholarshipError) {
                clearError();
                refreshScholarships();
              } else {
                setSelectedFilter('all');
              }
            }}
          >
            <ThemedText variant="button" color="inverted" style={styles.emptyStateButtonText}>
              {scholarshipError ? 'Retry' : 'View All'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <BackToTopButton scrollY={scrollY} onPress={scrollToTop} />
    </SafeAreaView>
  );
});

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
