import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { UserProfile as ApiUserProfile } from '@/lib/api';
import Colors from '@/constants/colors';
import Logo from '@/components/Logo';
import { User, Mail, Lock, BookOpen, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react-native';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    major: '',
    year: 'Freshman',
    interests: [] as string[],
    school_name: 'University of Texas at Dallas',
    ftcs_status: 'No',
    gpa_range: '3.0 - 3.5',
    educational_goals: 'Graduate with honors',
    age: '20',
    gender: 'Prefer not to say',
    race_ethnicity: 'Prefer not to say',
    working_hours: '0-10',
    stress_level: 'Moderate',
    self_efficacy: 'High',
    avatar_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUpWithEmailPassword, error, clearError } = useUserStore();

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    // Basic validation
    if (!formData.name.trim() || !formData.surname.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!formData.major.trim()) {
      Alert.alert('Error', 'Please select your major');
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const userData: ApiUserProfile = {
        ...formData,
        name: `${formData.name.trim()} ${formData.surname.trim()}`,
        email: formData.email.trim(),
        major: formData.major.trim(),
      };

      const success = await signUpWithEmailPassword(
        userData.email,
        formData.password,
        userData
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

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Basic validation
    if (!formData.name.trim() || !formData.surname.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!formData.major.trim()) {
      Alert.alert('Error', 'Please select your major');
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    // Navigate to interests screen with form data
    router.push({
      pathname: '/auth/interests',
      params: {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password,
        major: formData.major,
        year: formData.year,
        school_name: formData.school_name,
        ftcs_status: formData.ftcs_status,
        gpa_range: formData.gpa_range,
        educational_goals: formData.educational_goals,
        age: formData.age,
        gender: formData.gender,
        race_ethnicity: formData.race_ethnicity,
        working_hours: formData.working_hours,
        stress_level: formData.stress_level,
        self_efficacy: formData.self_efficacy,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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

          <View style={styles.logoContainer}>
            <Logo size={80} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Campus Connect to get personalized recommendations
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <User size={20} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholderTextColor={Colors.textSecondary}
                    editable={!isLoading}
                  />
                </View>
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <User size={20} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    value={formData.surname}
                    onChangeText={(value) => handleInputChange('surname', value)}
                    placeholderTextColor={Colors.textSecondary}
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={Colors.textSecondary}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <Lock size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  placeholderTextColor={Colors.textSecondary}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Major</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <GraduationCap size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your major"
                  value={formData.major}
                  onChangeText={(value) => handleInputChange('major', value)}
                  placeholderTextColor={Colors.textSecondary}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Academic Year</Text>
              <View style={styles.yearButtons}>
                {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      formData.year === year && styles.selectedYearButton
                    ]}
                    onPress={() => handleInputChange('year', year)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.yearButtonText,
                      formData.year === year && styles.selectedYearButtonText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.disabledButton, { marginTop: 20, marginBottom: 16 }]}
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
              Next, you'll select interests to personalize your experience
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 44, // Space for the icon
  },
  inputWrapper: {
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  yearButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  yearButton: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedYearButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedYearButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  signInButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signInButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  interestsContainer: {
    marginBottom: 24,
  },
  interestsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  interestsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  interestTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  interestTag: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedInterestTag: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedInterestTagText: {
    color: Colors.white,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
