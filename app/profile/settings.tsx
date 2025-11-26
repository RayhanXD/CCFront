import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import CustomStatusBar from '@/components/CustomStatusBar';
import { useRouter } from 'expo-router';
import { 
  ChevronRightIcon as ChevronRight, 
  ArrowLeftIcon as ArrowLeft, 
  MoonIcon as Moon, 
  AlertTriangleIcon as AlertTriangle, 
  InfoIcon as Info,
  BellIcon as Bell,
  LockIcon as Lock
} from '@/components/icons';
import { useTheme } from '@/contexts/theme-context';
import { useUserStore } from '@/store/user-store';
import apiService from '@/lib/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { userProfile, signOutFirebase, updateUserProfile } = useUserStore();
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile?.preferences?.notifications ?? true);
  const [privacyMode, setPrivacyMode] = useState(userProfile?.preferences?.privacyMode ?? false);
  
  // Load user preferences when component mounts
  useEffect(() => {
    if (userProfile?.preferences) {
      setNotificationsEnabled(userProfile.preferences.notifications ?? true);
      setPrivacyMode(userProfile.preferences.privacyMode ?? false);
    }
  }, [userProfile]);

  // Handle toggling notifications
  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (userProfile?.email) {
      try {
        await updateUserProfile({
          preferences: {
            ...userProfile.preferences,
            notifications: value
          }
        });
      } catch (error) {
        console.error('Failed to update notification preferences:', error);
        // Revert the toggle if update fails
        setNotificationsEnabled(!value);
        Alert.alert('Error', 'Failed to update notification preferences');
      }
    }
  };

  // Handle toggling privacy mode
  const handleTogglePrivacyMode = async (value: boolean) => {
    setPrivacyMode(value);
    if (userProfile?.email) {
      try {
        await updateUserProfile({
          preferences: {
            ...userProfile.preferences,
            privacyMode: value
          }
        });
      } catch (error) {
        console.error('Failed to update privacy preferences:', error);
        // Revert the toggle if update fails
        setPrivacyMode(!value);
        Alert.alert('Error', 'Failed to update privacy preferences');
      }
    }
  };


  // Handle account deactivation
  const handleDeactivateAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              if (userProfile?.email) {
                // Call API to deactivate account
                await apiService.updateProfile({
                  ...userProfile as any,
                  status: 'deactivated'
                });
                
                // Sign out and redirect to sign in
                await signOutFirebase();
                setIsLoading(false);
                
                Alert.alert(
                  'Account Deactivated',
                  'Your account has been deactivated. You will be logged out now.',
                  [{ text: 'OK', onPress: () => router.replace('/auth/signin') }]
                );
              }
            } catch (error) {
              setIsLoading(false);
              console.error('Failed to deactivate account:', error);
              Alert.alert('Error', 'Failed to deactivate your account. Please try again later.');
            }
          }
        }
      ]
    );
  };

  const handleAboutUs = () => {
    router.push('/profile/about' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Custom Header */}
      <View style={[
        styles.header, 
        { 
          borderBottomColor: theme.border,
          backgroundColor: theme.background,
          shadowColor: isDarkMode ? '#000' : theme.shadow,
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
        }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={theme.text} strokeWidth={isDarkMode ? 2.5 : 2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        <View style={[styles.section, { backgroundColor: theme.white }]}>
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#322A4C' : '#E8E3FF' }]}>
                <Moon size={18} color={theme.primary} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
        <View style={[styles.section, { backgroundColor: theme.white }]}>
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2A4C3D' : '#E5FFF0' }]}>
                <Bell size={18} color="#00C853" />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingItem]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2A3D4C' : '#E5F5FF' }]}>
                <Lock size={18} color="#0085FF" />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>
                Privacy Mode
              </Text>
            </View>
            <Switch
              value={privacyMode}
              onValueChange={handleTogglePrivacyMode}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* About & Support Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About & Support</Text>
        <View style={[styles.section, { backgroundColor: theme.white }]}>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={handleAboutUs}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2A4C3D' : '#E5FFF0' }]}>
                <Info size={18} color="#00C853" />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>
                About Us
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleDeactivateAccount}
            disabled={isLoading}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#4C2A2A' : '#FFE5E5' }]}>
                <AlertTriangle size={18} color="#FF3B30" />
              </View>
              <Text style={[styles.settingText, { color: '#FF3B30' }]}>
                Deactivate Account
              </Text>
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ChevronRight size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageOption: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLanguage: {
    backgroundColor: '#E8E3FF',
  },
  languageText: {
    fontSize: 16,
  },
  modalButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
