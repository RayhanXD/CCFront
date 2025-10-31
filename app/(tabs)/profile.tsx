import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, User, BookOpen, Award, Heart, Settings, Edit } from 'lucide-react-native';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { useUserStore } from '@/store/user-store';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, signOutFirebase } = useUserStore();
  const { theme, isDarkMode } = useTheme();
  
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  const handleSavedItems = () => {
    router.push('/profile/saved');
  };
  
  const handleSettings = () => {
    router.push('/profile/settings');
  };

  const handleLogout = async () => {
    try {
      await signOutFirebase()
      router.replace('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  
  
  // Placeholder avatar URL
  const avatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80';
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.primaryLight }]}
            onPress={handleEditProfile}
          >
            <Edit size={18} color={theme.primary} />
            <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>{userProfile?.name || 'Student Name'}</Text>
              <Text style={[styles.profileDetails, { color: theme.textSecondary }]}>{userProfile?.major || 'Major'} • {userProfile?.year || 'Year'}</Text>
            </View>
          </View>
          
          <View style={[styles.interestsContainer, { borderTopColor: theme.border }]}>
            <Text style={[styles.interestsTitle, { color: theme.text }]}>Interests</Text>
            <View style={styles.interestTags}>
              {userProfile?.interests && userProfile.interests.length > 0 ? (
                userProfile.interests.map((interest, index) => (
                  <View key={index} style={[styles.interestTag, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.interestTagText, { color: theme.primary }]}>{interest}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noInterestsText, { color: theme.textSecondary }]}>No interests added yet</Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={[styles.menuSection, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={handleSavedItems}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: theme.primaryLight }]}>
                <Heart size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Saved Items</Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? '#333333' : '#F0F0F0' }]}>
                <Settings size={18} color={theme.text} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Settings</Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsSection}>
          <Text style={[styles.statsSectionTitle, { color: theme.text }]}>Your Activity</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.primaryLight }]}>
                <User size={20} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>5</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Organizations</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
              <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? '#162A39' : '#E5F5FF' }]}>
                <Award size={20} color="#0085FF" />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>3</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Scholarships</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
              <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? '#332815' : '#FFF2E5' }]}>
                <BookOpen size={20} color="#FF8A00" />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Events</Text>
            </View>
          </View>
        </View>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.logoutButton }]} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
           </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Import Colors for backward compatibility
import Colors from '@/constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  interestsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  interestsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  interestTagText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  noInterestsText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  statsSection: {
    marginHorizontal: 20,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  logoutButton: {
    backgroundColor: Colors.logoutButton,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
})