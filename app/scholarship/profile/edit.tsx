import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { Check } from 'lucide-react-native';

// Reuse the interests from the onboarding
const INTERESTS = [
  "Academic Clubs",
  "Sports",
  "Arts & Culture",
  "Technology",
  "Science",
  "Business",
  "Social Impact",
  "Environmental",
  "Health & Wellness",
  "Leadership",
  "Research",
  "International",
  "Professional Development",
  "Entertainment",
  "Gaming",
  "Music",
  "Dance",
  "Theater",
  "Media",
  "Politics"
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useUserStore();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [major, setMajor] = useState(userProfile?.major || '');
  const [year, setYear] = useState(userProfile?.year || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    userProfile?.interests || []
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    updateUserProfile({
      name,
      major,
      year,
      interests: selectedInterests
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Check size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              value={major}
              onChangeText={setMajor}
              placeholder="Enter your major"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="Enter your year"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.sectionSubtitle}>
            Select your interests to personalize your experience
          </Text>
          
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestButton,
                  selectedInterests.includes(interest) && styles.interestButtonSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text 
                  style={[
                    styles.interestButtonText,
                    selectedInterests.includes(interest) && styles.interestButtonTextSelected
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  interestButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  interestButtonTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
  saveButton: {
    marginRight: 8,
  },
});