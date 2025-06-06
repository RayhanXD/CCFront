import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';

const Header = () => {
  const router = useRouter();
  
  const tabs = [
    { name: 'Home', route: '/' },
    { name: 'Profile', route: '/profile' },
    { name: 'Scholarships', route: '/scholarships' },
    { name: 'Calendar', route: '/calendar' },
    { name: 'Recommendations', route: '/', active: true },
    { name: 'Feedback', route: '/feedback' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CampusConnect</Text>
      
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab.name}
            style={[styles.tab, tab.active && styles.activeTab]}
            onPress={() => router.push(tab.route)}
          >
            <Text style={[styles.tabText, tab.active && styles.activeTabText]}>
              {tab.name}
            </Text>
            {tab.active && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
        <LogOut size={16} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
});

export default Header;