import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Award, 
  Calendar, 
  DollarSign, 
  FileText, 
  Share2, 
  ExternalLink,
  Tag,
  Clock
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useScholarshipStore } from '@/store/scholarship-store';
import { LinearGradient } from 'expo-linear-gradient';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';

export default function ScholarshipDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { scholarships } = useScholarshipStore();
  
  // Find the scholarship by ID
  const scholarship = scholarships.find(schol => schol.id === id);
  
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Welcome', path: '/onboarding/welcome' },
    { label: 'Scholarship', path: `/onboarding/detail/scholarship/${id}` },
  ];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle share
  const handleShare = () => {
    console.log('Share scholarship');
  };
  
  if (!scholarship) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scholarship Details</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Scholarship not found</Text>
          <TouchableOpacity 
            style={styles.notFoundButton}
            onPress={() => router.back()}
          >
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const daysRemaining = getDaysRemaining(scholarship.deadline);
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
  const isPast = daysRemaining < 0;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scholarship Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <BreadcrumbNavigation items={breadcrumbItems} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primaryLight, Colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{scholarship.matchPercentage}% Match</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formatCurrency(scholarship.amount)}</Text>
            {scholarship.renewable && (
              <View style={styles.renewableBadge}>
                <Text style={styles.renewableBadgeText}>Renewable</Text>
              </View>
            )}
          </View>
        </LinearGradient>
        
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <Award size={20} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{scholarship.name}</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Share2 size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <DollarSign size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Provider: </Text>
                {scholarship.provider}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={16} color={isUrgent ? Colors.primary : Colors.textSecondary} />
              <Text 
                style={[
                  styles.infoText,
                  isUrgent && styles.urgentText,
                  isPast && styles.pastText
                ]}
              >
                <Text style={styles.infoLabel}>Deadline: </Text>
                {formatDate(scholarship.deadline)}
                {isPast ? ' (Passed)' : isUrgent ? ` (${daysRemaining} days left)` : ''}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Tag size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Type: </Text>
                {scholarship.type.charAt(0).toUpperCase() + scholarship.type.slice(1)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Estimated Time to Apply: </Text>
                2-3 hours
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {scholarship.description}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Eligibility Requirements</Text>
            <View style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>
                Minimum GPA of 3.0
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>
                Full-time enrollment status
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>
                Demonstrated leadership experience
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>
                U.S. citizenship or permanent residency
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Application Materials</Text>
            <View style={styles.materialItem}>
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.materialText}>Personal Statement (500-750 words)</Text>
            </View>
            <View style={styles.materialItem}>
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.materialText}>Official Transcript</Text>
            </View>
            <View style={styles.materialItem}>
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.materialText}>Two Letters of Recommendation</Text>
            </View>
            <View style={styles.materialItem}>
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.materialText}>Resume or CV</Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            {scholarship.tags.map((tag, index) => (
              <View key={`tag-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
            <ExternalLink size={16} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Provider</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    padding: 30,
    position: 'relative',
    alignItems: 'center',
  },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  matchText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  renewableBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  renewableBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  infoLabel: {
    fontWeight: '500',
  },
  urgentText: {
    color: Colors.primary,
  },
  pastText: {
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  materialText: {
    fontSize: 14,
    color: Colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 100,
    marginBottom: 12,
    gap: 8,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  contactButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  contactButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  notFoundButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  notFoundButtonText: {
    color: Colors.white,
    fontWeight: '500',
  },
});