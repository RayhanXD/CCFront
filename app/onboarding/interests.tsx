import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  TextInput,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Search, Plus, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import AnimatedCard from '@/components/AnimatedCard';

export default function InterestsScreen() {
  const router = useRouter();
  const { userProfile, setUserInterests } = useUserStore();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  
  const interestCategories = [
    {
      title: 'Academic',
      interests: ['Research', 'Study Groups', 'Tutoring', 'Academic Clubs', 'Conferences']
    },
    {
      title: 'Career',
      interests: ['Internships', 'Job Fairs', 'Networking', 'Resume Workshops', 'Industry Panels']
    },
    {
      title: 'Campus Life',
      interests: ['Student Government', 'Greek Life', 'Residence Life', 'Campus Events', 'Dining']
    },
    {
      title: 'Activities',
      interests: ['Sports', 'Arts', 'Music', 'Theater', 'Volunteering', 'Cultural Clubs', 'Nature', 'Camping']
    }
  ];
  
  // Combine all interests for searching
  const allInterests = interestCategories.flatMap(category => category.interests);
  
  // Filter interests based on search term
  const filteredCategories = searchTerm.trim() === '' 
    ? interestCategories 
    : interestCategories.map(category => ({
        title: category.title,
        interests: category.interests.filter(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.interests.length > 0);
  
  // Check if search term matches any existing interest
  const searchTermMatchesExisting = searchTerm.trim() !== '' && 
    allInterests.some(interest => 
      interest.toLowerCase() === searchTerm.toLowerCase()
    );
  
  // Check if search term matches any custom interest
  const searchTermMatchesCustom = searchTerm.trim() !== '' && 
    customInterests.some(interest => 
      interest.toLowerCase() === searchTerm.toLowerCase()
    );
  
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };
  
  const addCustomInterest = () => {
    if (searchTerm.trim() === '') return;
    
    const formattedInterest = searchTerm.trim();
    
    // Add to custom interests list if not already there
    if (!customInterests.includes(formattedInterest)) {
      setCustomInterests(prev => [...prev, formattedInterest]);
    }
    
    // Add to selected interests if not already there
    if (!selectedInterests.includes(formattedInterest)) {
      setSelectedInterests(prev => [...prev, formattedInterest]);
    }
    
    // Clear search term
    setSearchTerm('');
    Keyboard.dismiss();
  };
  
  const removeCustomInterest = (interest: string) => {
    // Remove from custom interests
    setCustomInterests(prev => prev.filter(item => item !== interest));
    
    // Remove from selected interests
    setSelectedInterests(prev => prev.filter(item => item !== interest));
  };
  
  const handleContinue = () => {
    try {
      // Save selected interests
      setUserInterests(selectedInterests);
      
      // Navigate to welcome screen
      router.push('/onboarding/welcome');
    } catch (error) {
      console.error("Error in handleContinue:", error);
    }
  };
  
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>What are you interested in?</Text>
        <Text style={styles.subtitle}>
          Select topics that interest you to get personalized recommendations
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or add interests..."
            value={searchTerm}
            onChangeText={handleSearchChange}
            returnKeyType="done"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {searchTerm.trim() !== '' && !searchTermMatchesExisting && !searchTermMatchesCustom && (
          <TouchableOpacity 
            style={styles.addCustomButton}
            onPress={addCustomInterest}
          >
            <Plus size={18} color={Colors.primary} />
            <Text style={styles.addCustomText}>Add "{searchTerm.trim()}"</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {customInterests.length > 0 && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>Your Custom Interests</Text>
            <View style={styles.interestsGrid}>
              {customInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <View key={interest} style={styles.customInterestContainer}>
                    <TouchableOpacity
                      style={[
                        styles.interestItem,
                        isSelected && styles.selectedInterestItem
                      ]}
                      onPress={() => toggleInterest(interest)}
                    >
                      <Text 
                        style={[
                          styles.interestText,
                          isSelected && styles.selectedInterestText
                        ]}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.removeCustomButton}
                      onPress={() => removeCustomInterest(interest)}
                    >
                      <X size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.interestsGrid}>
                {category.interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.interestItem,
                        isSelected && styles.selectedInterestItem
                      ]}
                      onPress={() => toggleInterest(interest)}
                    >
                      <Text 
                        style={[
                          styles.interestText,
                          isSelected && styles.selectedInterestText
                        ]}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        ) : searchTerm.trim() !== '' && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No matching interests found.
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search term or add it as a custom interest.
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionCount}>
            {selectedInterests.length} interests selected
          </Text>
        </View>
        
        <AnimatedCard>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color={Colors.white} />
          </TouchableOpacity>
        </AnimatedCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  addCustomText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  customInterestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedInterestItem: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedInterestText: {
    color: Colors.white,
    fontWeight: '500',
  },
  removeCustomButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginTop: -10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  selectionInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  selectionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
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
});