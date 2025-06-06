import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Users, Calendar, BookOpen, CircleCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCampusStore } from '@/store/campus-store';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const FilterTabs = () => {
  const { selectedFilter, setSelectedFilter } = useCampusStore();
  
  const tabs = [
    { 
      id: 'all', 
      label: 'All',
      icon: <CircleCheck size={isSmallScreen ? 14 : 16} color={selectedFilter === 'all' ? Colors.white : Colors.primary} />
    },
    { 
      id: 'organization', 
      label: 'Organizations',
      icon: <Users size={isSmallScreen ? 14 : 16} color={selectedFilter === 'organization' ? Colors.white : Colors.primary} />
    },
    { 
      id: 'event', 
      label: 'Events',
      icon: <Calendar size={isSmallScreen ? 14 : 16} color={selectedFilter === 'event' ? Colors.white : Colors.primary} />
    },
    { 
      id: 'tutoring', 
      label: 'Tutoring',
      icon: <BookOpen size={isSmallScreen ? 14 : 16} color={selectedFilter === 'tutoring' ? Colors.white : Colors.primary} />
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
            selectedFilter === tab.id && styles.activeTab
          ]}
          onPress={() => handleTabPress(tab.id as any)}
          activeOpacity={0.7}
        >
          {tab.icon}
          <Text 
            style={[
              styles.tabText,
              selectedFilter === tab.id && styles.activeTabText,
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
    backgroundColor: Colors.primaryLight,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 13,
  },
  smallText: {
    fontSize: 12,
  },
  activeTabText: {
    color: Colors.white,
  },
});

export default FilterTabs;