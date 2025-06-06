import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Award, Users, MessageSquare, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useEventsStore } from '@/store/events-store';
import { useScholarshipStore } from '@/store/scholarship-store';
import { useCampusStore } from '@/store/campus-store';
import Logo from '@/components/Logo';
import AnimatedCard from '@/components/AnimatedCard';
import { TodayEvent } from '@/types/events';
import { Scholarship } from '@/types/scholarship';
import { Organization } from '@/types/campus';

export default function WelcomeScreen() {
  const router = useRouter();
  const { userProfile, setOnboardingComplete } = useUserStore();
  const { todayEvents } = useEventsStore();
  const { scholarships } = useScholarshipStore();
  const { organizations } = useCampusStore();
  
  // Filter events based on user interests
  const relevantEvents = todayEvents.slice(0, 3);
  
  // Filter scholarships based on user major
  const relevantScholarships = scholarships.slice(0, 2);
  
  // Filter organizations based on user interests
  const relevantOrganizations = organizations.slice(0, 2);
  
  const handleGetStarted = () => {
    // Mark onboarding as complete
    setOnboardingComplete(true);
    
    // Navigate to main app
    router.replace('/');
  };

  // Handle card press for different types
  const handleEventPress = (id: string) => {
    // Use direct string navigation to avoid issues with dynamic routes
    router.push(`/onboarding/detail/event/${id}`);
  };

  const handleScholarshipPress = (id: string) => {
    router.push(`/onboarding/detail/scholarship/${id}`);
  };

  const handleOrganizationPress = (id: string) => {
    router.push(`/onboarding/detail/organization/${id}`);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo size={40} />
          <Text style={styles.welcomeText}>Welcome, {userProfile?.name?.split(' ')[0] || 'there'}!</Text>
        </View>
        <Text style={styles.subtitle}>
          Here's what we've personalized for you based on your {userProfile?.major} major
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Today's Events for You</Text>
          </View>
          
          {relevantEvents.map((event, index) => (
            <AnimatedCard
              key={index}
              style={styles.card}
              onPress={() => handleEventPress(event.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <View style={styles.relevanceBadge}>
                  <Text style={styles.relevanceText}>{event.relevanceScore}%</Text>
                </View>
              </View>
              <Text style={styles.cardTime}>{event.startTime} - {event.endTime}</Text>
              <Text style={styles.cardLocation}>{event.location}</Text>
              
              <View style={styles.viewMoreContainer}>
                <Text style={styles.viewMoreText}>View details</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </View>
            </AnimatedCard>
          ))}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Scholarship Opportunities</Text>
          </View>
          
          {relevantScholarships.map((scholarship, index) => (
            <AnimatedCard
              key={index}
              style={styles.card}
              onPress={() => handleScholarshipPress(scholarship.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{scholarship.name}</Text>
                <View style={styles.relevanceBadge}>
                  <Text style={styles.relevanceText}>{scholarship.matchPercentage}%</Text>
                </View>
              </View>
              <Text style={styles.cardAmount}>
                ${scholarship.amount.toLocaleString()}
              </Text>
              <Text style={styles.cardDeadline}>
                Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
              </Text>
              
              <View style={styles.viewMoreContainer}>
                <Text style={styles.viewMoreText}>View details</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </View>
            </AnimatedCard>
          ))}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Recommended Organizations</Text>
          </View>
          
          {relevantOrganizations.map((org, index) => (
            <AnimatedCard
              key={index}
              style={styles.card}
              onPress={() => handleOrganizationPress(org.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{org.name}</Text>
                <View style={styles.relevanceBadge}>
                  <Text style={styles.relevanceText}>{org.matchPercentage}%</Text>
                </View>
              </View>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {org.description}
              </Text>
              
              <View style={styles.viewMoreContainer}>
                <Text style={styles.viewMoreText}>View details</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </View>
            </AnimatedCard>
          ))}
        </View>
        
        <View style={styles.aiSection}>
          <View style={styles.aiCard}>
            <View style={styles.aiIconContainer}>
              <MessageSquare size={24} color={Colors.white} />
            </View>
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>CampusAI Assistant</Text>
              <Text style={styles.aiDescription}>
                Ask me anything about campus resources, events, or academic information!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  relevanceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  relevanceText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  cardTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardDeadline: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  aiSection: {
    marginBottom: 24,
  },
  aiCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  getStartedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});