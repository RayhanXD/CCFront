import React, { useState, useEffect } from 'react';
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
import { UserProfile as ApiUserProfile, University } from '@/lib/api';
import apiService from '@/lib/api';
import Colors from '@/constants/colors';
import Logo from '@/components/Logo';
import FormPicker from '@/components/FormPicker';
import {
  UserIcon as User,
  MailIcon as Mail,
  LockIcon as Lock,
  BookOpenIcon as BookOpen,
  GraduationCapIcon as GraduationCap,
  ArrowRightIcon as ArrowRight,
  ArrowLeftIcon as ArrowLeft,
  Building2Icon as Building2,
  BriefcaseIcon as Briefcase,
  HeartIcon as Heart,
  TrendingUpIcon as TrendingUp,
  TargetIcon as Target,
} from '@/components/icons';
import * as SignupOptions from '@/constants/signupOptions';

export default function SignUpNewScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [password, setPassword] = useState('');
  
  const [formData, setFormData] = useState<Partial<ApiUserProfile>>({
    name: '',
    surname: '',
    email: '',
    major: '',
    year: 'Freshman',
    school_name: '', // Will store university short_hand (doc ID)
    ftcs_status: 'No',
    gpa_range: '3.0 - 3.5',
    educational_goals: 'Complete my degree',
    age: '',
    gender: 'Prefer not to say',
    race_ethnicity: 'Prefer not to say',
    working_hours: '0',
    stress_level: 'Moderate',
    self_efficacy: 'High',
    academic_difficulty: null,
    current_gpa: null,
    family_responsibilities: null,
    financial_factors: null,
    high_school_grades: null,
    opportunity_to_transfer: null,
    outside_encouragement: null,
    satisfaction: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUpWithEmailPassword, error, clearError } = useUserStore();

  // Fetch universities on mount
  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const unis = await apiService.getUniversities();
      setUniversities(unis);
      console.log('✅ Loaded universities:', unis.length);
    } catch (err) {
      console.error('❌ Failed to load universities:', err);
      Alert.alert('Error', 'Failed to load universities. Please try again.');
    } finally {
      setLoadingUniversities(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info
        if (!formData.name?.trim() || !formData.surname?.trim()) {
          Alert.alert('Error', 'Please enter your full name');
          return false;
        }
        if (!formData.email?.trim() || !formData.email.includes('@')) {
          Alert.alert('Error', 'Please enter a valid email address');
          return false;
        }
        if (!password || password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters');
          return false;
        }
        return true;

      case 2: // Academic Info
        if (!formData.school_name) {
          Alert.alert('Error', 'Please select your university');
          return false;
        }
        if (!formData.major?.trim()) {
          Alert.alert('Error', 'Please enter your major');
          return false;
        }
        if (!formData.year) {
          Alert.alert('Error', 'Please select your year');
          return false;
        }
        return true;

      case 3: // Demographics (optional)
        return true;

      case 4: // Academic Details (optional)
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSignUp = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const userData: ApiUserProfile = {
        ...formData as ApiUserProfile,
        name: formData.name!.trim(),
        surname: formData.surname!.trim(),
        email: formData.email!.trim(),
        major: formData.major!.trim(),
      };

      // Don't create user yet - just navigate to interests screen
      // The actual signup will happen after interests are collected
      console.log('✅ Basic info collected, navigating to interests...');
      router.push({
        pathname: '/auth/interests',
        params: {
          ...userData,
          password: password,
        },
      });
    } catch (err) {
      console.error('❌ Unexpected signup error:', err);
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      Alert.alert('Error', errorMsg, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const universityOptions = universities.map(uni => ({
    label: `${uni.name} (${uni.short_hand})`,
    value: uni.short_hand, // Store the doc ID
  }));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderAcademicInfo();
      case 3:
        return renderDemographics();
      case 4:
        return renderAcademicDetails();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepDescription}>Let's start with your basic details</Text>

      <View style={styles.inputContainer}>
        <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={formData.surname}
          onChangeText={(value) => handleInputChange('surname', value)}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password (min. 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
    </View>
  );

  const renderAcademicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Academic Information</Text>
      <Text style={styles.stepDescription}>Tell us about your studies</Text>

      {loadingUniversities ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        <FormPicker
          label="University"
          value={formData.school_name || ''}
          options={universityOptions}
          onValueChange={(value) => handleInputChange('school_name', value)}
          placeholder="Select your university"
          required
          icon={<Building2 size={20} color={Colors.textSecondary} />}
        />
      )}

      <View style={styles.inputContainer}>
        <BookOpen size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Major / Field of Study"
          value={formData.major}
          onChangeText={(value) => handleInputChange('major', value)}
        />
      </View>

      <FormPicker
        label="Year"
        value={formData.year || ''}
        options={SignupOptions.YEAR_OPTIONS}
        onValueChange={(value) => handleInputChange('year', value)}
        required
        icon={<GraduationCap size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="First-generation college student?"
        value={formData.ftcs_status || ''}
        options={SignupOptions.FTCS_STATUS_OPTIONS}
        onValueChange={(value) => handleInputChange('ftcs_status', value)}
        icon={<User size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="GPA Range"
        value={formData.gpa_range || ''}
        options={SignupOptions.GPA_RANGE_OPTIONS}
        onValueChange={(value) => handleInputChange('gpa_range', value)}
        icon={<TrendingUp size={20} color={Colors.textSecondary} />}
      />
    </View>
  );

  const renderDemographics = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Demographics</Text>
      <Text style={styles.stepDescription}>Optional - helps us personalize your experience</Text>

      <View style={styles.inputContainer}>
        <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Age (optional)"
          value={formData.age}
          onChangeText={(value) => handleInputChange('age', value)}
          keyboardType="numeric"
        />
      </View>

      <FormPicker
        label="Gender"
        value={formData.gender || ''}
        options={SignupOptions.GENDER_OPTIONS}
        onValueChange={(value) => handleInputChange('gender', value)}
        icon={<User size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Race/Ethnicity"
        value={formData.race_ethnicity || ''}
        options={SignupOptions.RACE_ETHNICITY_OPTIONS}
        onValueChange={(value) => handleInputChange('race_ethnicity', value)}
        icon={<User size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Working Hours per Week"
        value={formData.working_hours || ''}
        options={SignupOptions.WORKING_HOURS_OPTIONS}
        onValueChange={(value) => handleInputChange('working_hours', value)}
        icon={<Briefcase size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Educational Goals"
        value={formData.educational_goals || ''}
        options={SignupOptions.EDUCATIONAL_GOALS_OPTIONS}
        onValueChange={(value) => handleInputChange('educational_goals', value)}
        icon={<Target size={20} color={Colors.textSecondary} />}
      />
    </View>
  );

  const renderAcademicDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Academic & Wellbeing</Text>
      <Text style={styles.stepDescription}>Optional - helps us provide better support</Text>

      <FormPicker
        label="Stress Level"
        value={formData.stress_level || ''}
        options={SignupOptions.STRESS_LEVEL_OPTIONS}
        onValueChange={(value) => handleInputChange('stress_level', value)}
        icon={<Heart size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Self-Efficacy (Confidence in abilities)"
        value={formData.self_efficacy || ''}
        options={SignupOptions.SELF_EFFICACY_OPTIONS}
        onValueChange={(value) => handleInputChange('self_efficacy', value)}
        icon={<TrendingUp size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Academic Difficulty"
        value={formData.academic_difficulty || ''}
        options={SignupOptions.ACADEMIC_DIFFICULTY_OPTIONS}
        onValueChange={(value) => handleInputChange('academic_difficulty', value)}
        placeholder="Select difficulty level"
        icon={<BookOpen size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Family Responsibilities"
        value={formData.family_responsibilities || ''}
        options={SignupOptions.LEVEL_OPTIONS}
        onValueChange={(value) => handleInputChange('family_responsibilities', value)}
        placeholder="Select level"
        icon={<User size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Financial Factors"
        value={formData.financial_factors || ''}
        options={SignupOptions.LEVEL_OPTIONS}
        onValueChange={(value) => handleInputChange('financial_factors', value)}
        placeholder="Select level"
        icon={<Briefcase size={20} color={Colors.textSecondary} />}
      />

      <FormPicker
        label="Overall Satisfaction"
        value={formData.satisfaction || ''}
        options={SignupOptions.SATISFACTION_OPTIONS}
        onValueChange={(value) => handleInputChange('satisfaction', value)}
        placeholder="Select satisfaction level"
        icon={<Heart size={20} color={Colors.textSecondary} />}
      />
    </View>
  );

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Logo size={60} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {renderStep()}

          <View style={styles.buttonContainer}>
            {currentStep < totalSteps ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <ArrowRight size={20} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>Continue to Interests</Text>
                    <ArrowRight size={20} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color={Colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.text,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
