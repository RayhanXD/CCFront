import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useScholarshipStore } from '@/store/scholarship-store';
import { useTheme } from '@/contexts/theme-context';
import ThemedText from './ThemedText';

// Component will re-render when store state changes
function ScholarshipFilterTabs() {
  const { selectedFilter, setSelectedFilter, getAvailableFilters, availableCategories } = useScholarshipStore();
  const filters = getAvailableFilters();
  const { theme, isDarkMode } = useTheme();

  console.log('📚 ScholarshipFilterTabs render:', {
    availableCategories,
    filters,
    selectedFilter,
    filtersLength: filters.length
  });

  if (filters.length <= 1) {
    console.log('📚 Only "All" filter available, no categories to show');
  }

  return (
    <View style={styles.container}>
      {filters.length === 0 ? (
        <View style={styles.noFiltersContainer}>
          <ThemedText variant="bodySmall" color="secondary">
            No filters available
          </ThemedText>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {filters.map((filter) => {
          const isActive = selectedFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                { 
                  backgroundColor: isActive 
                    ? theme.primary 
                    : isDarkMode ? theme.cardBackground : theme.white,
                  borderColor: isActive ? theme.primary : theme.border,
                }
              ]}
              onPress={() => {
                // Only update if the filter has changed
                if (selectedFilter !== filter.id) {
                  setSelectedFilter(filter.id as any);
                }
              }}
            >
              <ThemedText 
                variant="bodySmall" 
                weight={isActive ? 'semibold' : 'medium'}
                color={isActive ? 'inverted' : 'secondary'}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    marginRight: 8,
  },
  noFiltersContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});

export default ScholarshipFilterTabs;