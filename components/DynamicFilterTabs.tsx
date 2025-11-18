import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { CircleCheck, GraduationCap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/theme-context';
import { Organization } from '@/lib/api';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

interface DynamicFilterTabsProps {
  organizations: Organization[];
  onFilterChange: (selectedMajors: string[]) => void;
}

const DynamicFilterTabs: React.FC<DynamicFilterTabsProps> = ({ organizations, onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const { theme, isDarkMode } = useTheme();
  
  // Extract unique majors from organizations
  const availableMajors = useMemo(() => {
    const majorsSet = new Set<string>();
    
    organizations.forEach(org => {
      // Add the main major field
      if (org.major && org.major !== 'General Studies') {
        majorsSet.add(org.major);
      }
    });
    
    // Convert to array and sort
    const majorsArray = Array.from(majorsSet).sort();
    
    // Add "All" at the beginning
    return ['All', ...majorsArray];
  }, [organizations]);

  const handleTabPress = (major: string) => {
    let newSelectedFilters: string[];
    
    if (major === 'All') {
      newSelectedFilters = ['All'];
    } else {
      // Remove 'All' if it's selected and we're selecting a specific major
      const currentFilters = selectedFilters.filter(f => f !== 'All');
      
      if (selectedFilters.includes(major)) {
        // Remove the major if it's already selected
        newSelectedFilters = currentFilters.filter(f => f !== major);
        
        // If no filters left, select 'All'
        if (newSelectedFilters.length === 0) {
          newSelectedFilters = ['All'];
        }
      } else {
        // Add the major to selected filters
        newSelectedFilters = [...currentFilters, major];
      }
    }
    
    setSelectedFilters(newSelectedFilters);
    onFilterChange(newSelectedFilters);
  };

  const getIcon = (major: string, isSelected: boolean) => {
    if (major === 'All') {
      return (
        <CircleCheck 
          size={isSmallScreen ? 14 : 16} 
          color={isSelected ? theme.white : theme.primary} 
          strokeWidth={isDarkMode ? 2.5 : 2} 
        />
      );
    }
    
    return (
      <GraduationCap 
        size={isSmallScreen ? 14 : 16} 
        color={isSelected ? theme.white : theme.primary} 
        strokeWidth={isDarkMode ? 2.5 : 2} 
      />
    );
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      {availableMajors.map((major) => {
        const isSelected = selectedFilters.includes(major);
        
        return (
          <TouchableOpacity
            key={major}
            style={[
              styles.tab,
              { backgroundColor: isDarkMode ? theme.primaryLight : Colors.primaryLight },
              isSelected && [styles.activeTab, { backgroundColor: theme.primary }]
            ]}
            onPress={() => handleTabPress(major)}
            activeOpacity={0.7}
          >
            {getIcon(major, isSelected)}
            <Text 
              style={[
                styles.tabText,
                { color: theme.primary },
                isSelected && [styles.activeTabText, { color: theme.white }],
                isSmallScreen && styles.smallText
              ]}
              numberOfLines={1}
            >
              {major}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
  },
  scrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 6,
    minWidth: 60,
  },
  activeTab: {
    // backgroundColor set inline
  },
  tabText: {
    fontWeight: '500',
    fontSize: 13,
  },
  smallText: {
    fontSize: 12,
  },
  activeTabText: {
    // color set inline
  },
});

export default DynamicFilterTabs;
