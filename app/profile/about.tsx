import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, FileText, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import Logo from '@/components/Logo';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleContactUs = () => {
    Linking.openURL('mailto:support@campusconnect.edu');
  };

  const handleTermsOfService = () => {
    // Navigate to terms of service or open a web link
    Linking.openURL('https://campusconnect.edu/terms');
  };

  const handlePrivacyPolicy = () => {
    // Navigate to privacy policy or open a web link
    Linking.openURL('https://campusconnect.edu/privacy');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.aboutCard, { backgroundColor: theme.white }]}>
          <View style={styles.logoContainer}>
            <Logo size={60} />
          </View>
          
          <Text style={[styles.appName, { color: theme.text }]}>Campus Connect</Text>
          
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>
            {t.aboutUs.version} 1.0.0
          </Text>
          
          <Text style={[styles.descriptionText, { color: theme.text }]}>
            {t.aboutUs.description}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.white }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={handleContactUs}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                <Mail size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {t.aboutUs.contactUs}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={handleTermsOfService}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5F5FF' }]}>
                <FileText size={18} color="#0085FF" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {t.aboutUs.termsOfService}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5FFF0' }]}>
                <Shield size={18} color="#00C853" />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {t.aboutUs.privacyPolicy}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            © 2025 Campus Connect
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  aboutCard: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
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
  menuItemText: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
  },
});
