import React, { useState, useEffect, useCallback } from 'react';
import CustomStatusBar from '@/components/CustomStatusBar';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
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
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Share as ShareIcon,
  AlertTriangle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import { useCalendarStore } from '@/store/calendar-store';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import { CalendarEvent } from '@/types/calendar';
import { TodayEvent } from '@/types/events';
import { apiService } from '@/lib/api';
import * as WebBrowser from 'expo-web-browser';
import * as Calendar from 'expo-calendar';
import * as Sharing from 'expo-sharing';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

type EventType = (CalendarEvent | TodayEvent) & {
  id: string;
  title: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  img?: string;
  date?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  organizer?: string;
  tags?: string[];
  relevanceScore?: number;
  isRecurring?: boolean;
  url?: string;
  importantInfo?: string;
  audience?: string;
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { todayEvents, saveEvent, unsaveEvent, isEventSaved } = useEventsStore();
  const { events: calendarEvents } = useCalendarStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [event, setEvent] = useState<CalendarEvent | TodayEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError('No event ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // First check local stores
      let foundEvent = todayEvents.find(e => e.id === id) || 
                      calendarEvents.find(e => e.id === id);
      
      // If not found locally, try to fetch from API
      if (!foundEvent) {
        try {
          const response = await apiService.getEventById(id);
          if (response) {
            foundEvent = response as TodayEvent;
          }
        } catch (err) {
          console.warn('Failed to fetch event from API:', err);
        }
      }
      
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, todayEvents, calendarEvents]);
  
  // Initial load
  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);
  
  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvent();
  }, [fetchEvent]);
  
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
      const eventDate = 'date' in event ? event.date : '';
      const eventTime = 'time' in event ? event.time : 
                      ('startTime' in event ? event.startTime : '');
      
      const message = `Check out "${event.title}" on ${eventDate} at ${eventTime}!`;
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
  
  if (loading) {
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
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
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
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.centered}>
          <AlertTriangle size={48} color={Colors.danger} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error || 'Event not found'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchEvent}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
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
          {('imageUrl' in event && event.imageUrl) || ('img' in event && event.img) ? (
            <Image 
              source={{ uri: ('imageUrl' in event && event.imageUrl) ? event.imageUrl : 
                       ('img' in event ? event.img : undefined) }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, 'color' in event && event.color ? { backgroundColor: event.color } : null]}>
              <CalendarIcon size={48} color={Colors.white} />
            </View>
          )}
          
          {'relevanceScore' in event && event.relevanceScore && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{event.relevanceScore}% Match</Text>
            </View>
          )}
          
          {'isRecurring' in event && event.isRecurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringBadgeText}>Recurring</Text>
            </View>
          )}
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
          
          {'tags' in event && event.tags && event.tags.length > 0 && (
            <View style={styles.categoryBadge}>
              <Tag size={14} color={Colors.primary} />
              <Text style={styles.categoryText}>{event.tags[0]}</Text>
            </View>
          )}
          
          <View style={styles.infoContainer}>
            {'date' in event && event.date && (
              <View style={styles.infoItem}>
                <CalendarIcon size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  {formatDate(event.date)}
                </Text>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {'time' in event && event.time ? event.time : 
                 ('startTime' in event && 'endTime' in event) ? `${event.startTime} - ${event.endTime}` : 'Time not specified'}
              </Text>
            </View>
            
            {'duration' in event && event.duration && (
              <View style={styles.infoItem}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  Duration: {event.duration} minutes
                </Text>
              </View>
            )}
            
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
                Organized by: {'organizer' in event ? event.organizer : 'Unknown'}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {'description' in event && event.description && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>About This Event</Text>
                <Text style={[styles.description, !showFullDescription && styles.truncatedDescription]}>
                  {event.description}
                </Text>
                {event.description.length > 150 && (
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
            </>
          )}
          
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
                  <Text style={styles.detailText}>
                    {'tags' in event && event.tags && event.tags.length > 0 
                      ? `Students interested in ${event.tags.join(', ')}. All experience levels welcome.`
                      : 'All students are welcome to attend this event.'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {'tags' in event && event.tags && event.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsList}>
                {event.tags.map((tag: string, index: number) => (
                  <View key={`tag-${index}`} style={styles.tag}>
                    <Tag size={12} color={Colors.primary} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
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
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  recurringBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  recurringBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

