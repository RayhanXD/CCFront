import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import ScholarshipFilterTabs from '@/components/ScholarshipFilterTabs';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { useScholarshipStore } from '@/store/scholarship-store';
import Colors from '@/constants/colors';
import BackToTopButton from '@/components/BackToTopButton';

export default function ScholarshipsScreen() {
  const router = useRouter();
  const { filteredScholarships } = useScholarshipStore();
  const scrollY = new Animated.Value(0);
  const flatListRef = useRef<FlatList>(null);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.heroSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Financial <Text style={styles.titleHighlight}>Opportunities</Text>
          </Text>
          <Text style={styles.subtitle}>
            Discover scholarships and grants that match your academic profile
          </Text>
        </View>
      </View>
      
      <ScholarshipFilterTabs />
      
      <View style={styles.divider} />
      
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
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No scholarships found for this filter.
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => useScholarshipStore.getState().setSelectedFilter('all')}
          >
            <Text style={styles.emptyStateButtonText}>View All</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 36,
  },
  titleHighlight: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
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