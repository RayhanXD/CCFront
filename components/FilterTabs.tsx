import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Users, Calendar, BookOpen, CircleCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCampusStore } from '@/store/campus-store';
import { useTheme } from '@/contexts/theme-context';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const FilterTabs = () => {
  const { selectedFilter, setSelectedFilter } = useCampusStore();
  const { theme, isDarkMode } = useTheme();
  
  const tabs = [
    { 
      id: 'all', 
      label: 'All',
      icon: <CircleCheck size={isSmallScreen ? 14 : 16} color={selectedFilter === 'all' ? theme.white : theme.primary} strokeWidth={isDarkMode ? 2.5 : 2} />
    },
    { 
      id: 'organization', 
      label: 'Organizations',
      icon: <Users size={isSmallScreen ? 14 : 16} color={selectedFilter === 'organization' ? theme.white : theme.primary} strokeWidth={isDarkMode ? 2.5 : 2} />
    },
    { 
      id: 'event', 
      label: 'Events',
      icon: <Calendar size={isSmallScreen ? 14 : 16} color={selectedFilter === 'event' ? theme.white : theme.primary} strokeWidth={isDarkMode ? 2.5 : 2} />
    },
    { 
      id: 'tutoring', 
      label: 'Tutoring',
      icon: <BookOpen size={isSmallScreen ? 14 : 16} color={selectedFilter === 'tutoring' ? theme.white : theme.primary} strokeWidth={isDarkMode ? 2.5 : 2} />
    },
  ];

  const handleTabPress = (tabId: 'all' | 'organization' | 'event' | 'tutoring') => {
    setSelectedFilter(tabId);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            { backgroundColor: isDarkMode ? theme.primaryLight : Colors.primaryLight },
            selectedFilter === tab.id && [styles.activeTab, { backgroundColor: theme.primary }]
          ]}
          onPress={() => handleTabPress(tab.id as any)}
          activeOpacity={0.7}
        >
          {tab.icon}
          <Text 
            style={[
              styles.tabText,
              { color: theme.primary },
              selectedFilter === tab.id && [styles.activeTabText, { color: theme.white }],
              isSmallScreen && styles.smallText
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 6,
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

export default FilterTabs;