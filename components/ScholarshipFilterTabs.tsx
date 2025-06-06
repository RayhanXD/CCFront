import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Award, GraduationCap, Briefcase, Globe, CircleCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useScholarshipStore } from '@/store/scholarship-store';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const ScholarshipFilterTabs = () => {
  const { selectedFilter, setSelectedFilter } = useScholarshipStore();
  
  const tabs = [
    { 
      id: 'all', 
      label: 'All',
      icon: <CircleCheck size={isSmallScreen ? 14 : 16} color={selectedFilter === 'all' ? Colors.white : Colors.primary} />
    },
    { 
      id: 'merit', 
      label: 'Merit',
      icon: <Award size={isSmallScreen ? 14 : 16} color={selectedFilter === 'merit' ? Colors.white : Colors.primary} />
    },
    { 
      id: 'need', 
      label: 'Need',
      icon: <GraduationCap size={isSmallScreen ? 14 : 16} color={selectedFilter === 'need' ? Colors.white : Colors.primary} />
    },
    { 
      id: 'research', 
      label: 'Research',
      icon: <Briefcase size={isSmallScreen ? 14 : 16} color={selectedFilter === 'research' ? Colors.white : Colors.primary} />
    },
    { 
      id: 'international', 
      label: 'International',
      icon: <Globe size={isSmallScreen ? 14 : 16} color={selectedFilter === 'international' ? Colors.white : Colors.primary} />
    },
  ];

  const handleTabPress = (tabId: 'all' | 'merit' | 'need' | 'research' | 'international') => {
    setSelectedFilter(tabId);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 4,
  },
  container: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
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

export default ScholarshipFilterTabs;