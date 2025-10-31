import React, { useState } from 'react';
import CustomStatusBar from '@/components/CustomStatusBar';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StatusBar,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Building2, 
  User, 
  Calendar, 
  MapPin, 
  Share2, 
  ExternalLink,
  Mail,
  Globe,
  Bookmark,
  Tag,
  Users,
  Info
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCampusStore } from '@/store/campus-store';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import { useUserStore } from '@/store/user-store';

export default function OrganizationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organizations } = useCampusStore();
  const { saveOrganization, unsaveOrganization, isOrganizationSaved } = useUserStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Find the organization by ID
  const organization = organizations.find(org => org.id === id);
  
  // Check if organization is saved
  const saved = organization ? isOrganizationSaved?.(organization.id) || false : false;
  
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Organizations', path: '/' },
    { label: organization?.name || 'Organization Details', path: `/organization/${id}` },
  ];
  
  // Handle share
  const handleShare = () => {
    if (organization) {
      const message = `Check out ${organization.name} on Campus Connect!`;
      // In a real app, you would implement platform-specific sharing
      console.log('Share organization:', message);
    }
  };
  
  // Handle save/unsave
  const handleSaveToggle = () => {
    if (!organization) return;
    
    if (saved) {
      unsaveOrganization?.(organization.id);
    } else {
      saveOrganization?.(organization.id);
    }
  };
  
  // Handle website visit
  const handleVisitWebsite = () => {
    if (organization?.website) {
      Linking.openURL(organization.website).catch(err => {
        console.error("Couldn't open website URL:", err);
      });
    }
  };
  
  // Handle contact
  const handleContact = () => {
    if (organization?.email) {
      Linking.openURL(`mailto:${organization.email}`).catch(err => {
        console.error("Couldn't open email:", err);
      });
    }
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
      <CustomStatusBar style="dark" />
      
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
          <Text style={styles.title}>{organization.name}</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Share2 size={22} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, saved && styles.savedButton]}
              onPress={handleSaveToggle}
            >
              <Bookmark size={22} color={saved ? Colors.white : Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoryBadge}>
            <Tag size={14} color={Colors.primary} />
            <Text style={styles.categoryText}>{organization.category}</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <User size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {organization.president?.name || 'N/A'} • {organization.president?.role || 'President'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Users size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {organization.memberCount || '50+'} members
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {organization.meetingSchedule || 'Weekly meetings on Tuesdays at 5:00 PM'}
              </Text>
            </View>
            
            {organization.location ? (
              <View style={styles.infoItem}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  {organization.location}
                </Text>
              </View>
            ) : null}
            
            {organization.email && (
              <View style={styles.infoItem}>
                <Mail size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  {organization.email}
                </Text>
              </View>
            )}
            
            {organization.website && (
              <View style={styles.infoItem}>
                <Globe size={16} color={Colors.textSecondary} />
                <Text style={[styles.infoText, styles.linkText]} onPress={handleVisitWebsite}>
                  {organization.website.replace(/^https?:\/\//, '')}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={[styles.description, !showFullDescription && styles.truncatedDescription]}>
              {organization.description}
            </Text>
            {organization.description && organization.description.length > 150 && (
              <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={() => setShowFullDescription(!showFullDescription)}
              >
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => router.push('/calendar')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {organization.events && organization.events.length > 0 ? (
              organization.events.map((event, index) => (
                <TouchableOpacity 
                  key={`event-${index}`}
                  style={styles.eventCard}
                  onPress={() => router.push(`/event/${event.id}`)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventBadge}>
                      <Text style={styles.eventBadgeText}>{event.status || 'Upcoming'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.eventDetailText}>{event.date} • {event.time}</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noEventsContainer}>
                <Calendar size={24} color={Colors.textSecondary} />
                <Text style={styles.noEventsText}>No upcoming events</Text>
              </View>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Benefits of Joining</Text>
            <View style={styles.benefitsList}>
              {(organization.benefits || [
                'Professional development opportunities',
                'Networking with industry professionals',
                'Leadership experience',
                'Community service opportunities',
                'Resume building'  
              ]).map((benefit, index) => (
                <View key={`benefit-${index}`} style={styles.benefitItem}>
                  <View style={styles.benefitBullet} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={handleVisitWebsite}
          >
            <Text style={styles.websiteButtonText}>Visit Website</Text>
            <ExternalLink size={16} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>Contact Organization</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => console.log('Join organization')}
          >
            <Text style={styles.joinButtonText}>Join Organization</Text>
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
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  savedButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
    gap: 6,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
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
  truncatedDescription: {
    maxHeight: 100,
    overflow: 'hidden',
  },
  readMoreButton: {
    marginTop: 4,
    marginBottom: 8,
  },
  readMoreText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 14,
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
    marginBottom: 12,
  },
  contactButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    gap: 8,
  },
  noEventsText: {
    fontSize: 14,
    color: Colors.textSecondary,
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