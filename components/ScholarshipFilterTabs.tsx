import React, { memo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useScholarshipStore } from '@/store/scholarship-store';
import { useTheme } from '@/contexts/theme-context';
import ThemedText from './ThemedText';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'merit', label: 'Merit-Based' },
  { id: 'need', label: 'Need-Based' },
  { id: 'research', label: 'Research' },
  { id: 'international', label: 'International' },
];

// Use React.memo to prevent unnecessary re-renders
const ScholarshipFilterTabs = memo(function ScholarshipFilterTabs() {
  const { selectedFilter, setSelectedFilter } = useScholarshipStore();
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
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
    </View>
  );
});

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
});

export default ScholarshipFilterTabs;