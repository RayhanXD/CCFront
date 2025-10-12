import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StatusBar,
  Linking,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Bookmark,
  Tag,
  User,
  Users,
  Info,
  ExternalLink,
  CalendarPlus,
  AlertCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { todayEvents, saveEvent, unsaveEvent, isEventSaved } = useEventsStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Find the event by ID
  const event = todayEvents.find(event => event.id === id);
  
  // Check if event is saved
  const saved = event ? isEventSaved(event.id) : false;
  
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/calendar' },
    { label: event?.title || 'Event Details', path: `/event/${id}` },
  ];
  
  // Handle share
  const handleShare = () => {
    if (event) {
      const message = `Check out "${event.title}" on ${event.date} at ${event.startTime}!`;
      // In a real app, you would implement platform-specific sharing
      console.log('Share event:', message);
    }
  };
  
  // Handle save/unsave
  const handleSaveToggle = () => {
    if (!event) return;
    
    if (saved) {
      unsaveEvent(event.id);
    } else {
      saveEvent(event.id);
    }
  };
  
  // Handle calendar add
  const handleAddToCalendar = () => {
    if (!event) return;
    
    Alert.alert(
      "Add to Calendar",
      "This would add the event to your device calendar. Feature coming soon!",
      [{ text: "OK" }]
    );
  };
  
  // Handle registration
  const handleRegister = () => {
    if (!event) return;
    
    Alert.alert(
      "Registration",
      "You are about to register for this event. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Register", 
          onPress: () => Alert.alert("Success", "You have successfully registered for this event!") 
        }
      ]
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Event not found</Text>
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
        <Text style={styles.headerTitle}>Event Details</Text>
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
            source={{ uri: event.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{event.relevanceScore}% Match</Text>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{event.title}</Text>
          
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
            {event.tags && event.tags.length > 0 && (
              <>
                <Tag size={14} color={Colors.primary} />
                <Text style={styles.categoryText}>{event.tags[0]}</Text>
              </>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {formatDate(event.date)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {event.startTime} - {event.endTime}
              </Text>
            </View>
            
            {event.location ? (
              <View style={styles.infoItem}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  {event.location}
                </Text>
              </View>
            ) : null}
            
            <View style={styles.infoItem}>
              <User size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                Organized by: {event.organizer}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={[styles.description, !showFullDescription && styles.truncatedDescription]}>
              {event.description}
            </Text>
            {event.description && event.description.length > 150 && (
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
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            
            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <AlertCircle size={20} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailTitle}>Important Information</Text>
                  <Text style={styles.detailText}>Please bring your student ID for check-in. Refreshments will be provided.</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Users size={20} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailTitle}>Who Should Attend</Text>
                  <Text style={styles.detailText}>Students interested in {event.tags.join(', ')}. All experience levels welcome.</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Tags:</Text>
            <View style={styles.tagsList}>
              {event.tags.map((tag, index) => (
                <View key={`tag-${index}`} style={styles.tag}>
                  <Tag size={12} color={Colors.primary} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Register for Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={handleAddToCalendar}
          >
            <CalendarPlus size={16} color={Colors.primary} style={styles.buttonIcon} />
            <Text style={styles.calendarButtonText}>Add to Calendar</Text>
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
  tagsContainer: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 4,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  calendarButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calendarButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 4,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
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