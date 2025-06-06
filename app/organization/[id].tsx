import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Building2, 
  User, 
  Calendar, 
  MapPin, 
  Share2, 
  ExternalLink 
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCampusStore } from '@/store/campus-store';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';

export default function OrganizationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organizations } = useCampusStore();
  
  // Find the organization by ID
  const organization = organizations.find(org => org.id === id);
  
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Organization', path: `/organization/${id}` },
  ];
  
  // Handle share
  const handleShare = () => {
    console.log('Share organization');
  };
  
  if (!organization) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Organization Details</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Organization not found</Text>
          <TouchableOpacity 
            style={styles.notFoundButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.notFoundButtonText}>Go Back Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
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
        <Text style={styles.headerTitle}>Organization Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <BreadcrumbNavigation items={breadcrumbItems} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: organization.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{organization.matchPercentage}% Match</Text>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <Building2 size={20} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{organization.name}</Text>
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
              <User size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {organization.president.name} • {organization.president.role}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                Weekly meetings on Tuesdays at 5:00 PM
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                Student Union, Room 2.502
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              {organization.description}
            </Text>
            <Text style={styles.description}>
              Our mission is to provide students with opportunities to develop their leadership skills, network with professionals, and compete in business-related competitions at the local, state, and international levels.
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>New Member Orientation</Text>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>Next Week</Text>
                </View>
              </View>
              
              <View style={styles.eventDetail}>
                <Calendar size={14} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>Tuesday, Sep 15 • 5:00 PM</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <MapPin size={14} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>Student Union, Room 2.502</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.websiteButton}>
            <Text style={styles.websiteButtonText}>Visit Website</Text>
            <ExternalLink size={16} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Organization</Text>
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
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
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
    fontSize: 24,
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
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  eventBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  eventBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  websiteButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 100,
    marginBottom: 12,
    gap: 8,
  },
  websiteButtonText: {
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