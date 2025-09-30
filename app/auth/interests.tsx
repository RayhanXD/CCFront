import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { UserProfile as ApiUserProfile } from '@/lib/api';
import Colors from '@/constants/colors';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import INTERESTS from '@/constants/interests';

export default function InterestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signUpWithEmailPassword, error, clearError } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user data from params and ensure they are strings
  const userData = {
    name: String(params.name || ''),
    surname: String(params.surname || ''),
    email: String(params.email || ''),
    password: String(params.password || ''),
    major: String(params.major || ''),
    year: String(params.year || 'Freshman'),
    school_name: String(params.school_name || 'University of Texas at Dallas'),
    ftcs_status: String(params.ftcs_status || 'No'),
    gpa_range: String(params.gpa_range || '3.0 - 3.5'),
    educational_goals: String(params.educational_goals || 'Graduate with honors'),
    age: String(params.age || '20'),
    gender: String(params.gender || 'Prefer not to say'),
    race_ethnicity: String(params.race_ethnicity || 'Prefer not to say'),
    working_hours: String(params.working_hours || '0-10'),
    stress_level: String(params.stress_level || 'Moderate'),
    self_efficacy: String(params.self_efficacy || 'High'),
    avatar_url: String(params.avatar_url || ''),
  };

  const [interests, setInterests] = useState<string[]>([]);

  // Handle going back to signup screen
  const handleBack = () => {
    router.back();
  };

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(item => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Handle continue button press
  const handleContinue = async () => {
    // Validate interests
    if (interests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest to continue');
      return;
    }
    
    setIsLoading(true);
    clearError();

    try {
      const completeUserData: ApiUserProfile = {
        ...userData,
        interests,
        name: `${userData.name.trim()} ${userData.surname.trim()}`,
        email: userData.email.trim(),
        major: userData.major.trim(),
      };

      const success = await signUpWithEmailPassword(
        completeUserData.email,
        userData.password,
        completeUserData
      );
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Sign Up Failed', error || 'Please try again');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>What are you interested in?</Text>
          <Text style={styles.subtitle}>
            Select topics that interest you to get personalized recommendations
          </Text>
        </View>

        <View style={styles.interestTagsContainer}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestTag,
                interests.includes(interest) && styles.selectedInterestTag
              ]}
              onPress={() => toggleInterest(interest)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.interestTagText,
                interests.includes(interest) && styles.selectedInterestTagText
              ]}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.disabledButton]}
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <ArrowRight size={20} color={Colors.white} style={styles.continueButtonIcon} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  interestTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 40,
  },
  interestTag: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 12,
  },
  selectedInterestTag: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestTagText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedInterestTagText: {
    color: Colors.white,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  continueButtonIcon: {
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
