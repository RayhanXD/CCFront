import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  ScrollView,
  Modal,
  Pressable,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, User, GraduationCap, Mail, Search, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { allMajors } from '@/constants/majors';
import type { Major } from '@/types/major';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PersonalizeScreen() {
  const router = useRouter();
  const { setUserProfile } = useUserStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  
  const searchInputRef = useRef<TextInput>(null);
  const yearOptions = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
  
  useEffect(() => {
    if (showMajorModal) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showMajorModal]);

  const filteredMajors = searchQuery.trim() === '' 
    ? allMajors 
    : allMajors.filter(major => 
        major.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        major.school?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectMajor = (major: Major) => {
    setSelectedMajor(major);
    setMajor(major.name);
    setShowMajorModal(false);
    setSearchQuery('');
  };
  
  const handleContinue = () => {
    if (name.trim() === '' || !selectedMajor) {
      // In a real app, show validation errors
      return;
    }
    
    // Save user profile data
    setUserProfile({
      name,
      email,
      major: selectedMajor.name,
      year: year || 'Freshman',
      interests: [],
    });
    
    // Navigate to next screen
    router.push('/onboarding/interests');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>
              We'll use this information to personalize your experience
            </Text>
          </View>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Major</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowMajorModal(true)}
              >
                <GraduationCap size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <Text 
                  style={[
                    styles.majorText,
                    !selectedMajor && styles.placeholder
                  ]}
                >
                  {selectedMajor ? selectedMajor.name : "Select your major"}
                </Text>
              </TouchableOpacity>
              {selectedMajor?.concentrations && (
                <Text style={styles.concentrationsText}>
                  Available concentrations: {selectedMajor.concentrations.join(", ")}
                </Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year</Text>
              <View style={styles.yearOptions}>
                {yearOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.yearOption,
                      year === option && styles.selectedYearOption
                    ]}
                    onPress={() => setYear(option)}
                  >
                    <Text 
                      style={[
                        styles.yearOptionText,
                        year === option && styles.selectedYearOptionText
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showMajorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowMajorModal(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.searchContainer}>
                <Search size={20} color={Colors.textSecondary} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search majors..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowMajorModal(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {filteredMajors.length === 0 ? (
                <Text style={styles.noResults}>No majors found</Text>
              ) : (
                filteredMajors.map((major, index) => (
                  <TouchableOpacity
                    key={`${major.name}-${index}`}
                    style={styles.majorItem}
                    onPress={() => handleSelectMajor(major)}
                  >
                    <View>
                      <Text style={styles.majorName}>{major.name}</Text>
                      <Text style={styles.majorSchool}>{major.school}</Text>
                      <Text style={styles.majorDegree}>{major.degree}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
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
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
  },
  majorText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textSecondary,
  },
  concentrationsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  yearOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  yearOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedYearOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  yearOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedYearOptionText: {
    color: Colors.white,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.8,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  modalList: {
    flex: 1,
  },
  majorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  majorName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  majorSchool: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  majorDegree: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  noResults: {
    padding: 20,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
  },
});