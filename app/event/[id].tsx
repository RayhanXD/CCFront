import React, { useState, useEffect, useCallback } from 'react';
import CustomStatusBar from '@/components/CustomStatusBar';
import { 
  View, 
  Text, 
  StyleSheet, 
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { 
  ChevronLeftIcon as ChevronLeft, 
  ClockIcon as Clock, 
  MapPinIcon as MapPin, 
  Share2Icon as Share2, 
  BookmarkIcon as Bookmark,
  TagIcon as Tag,
  UserIcon as User,
  UsersIcon as Users,
  InfoIcon as Info,
  ExternalLinkIcon as ExternalLink,
  CalendarPlusIcon as CalendarPlus,
  AlertCircleIcon as AlertCircle,
  ArrowLeftIcon as ArrowLeft,
  CalendarIconComponent as CalendarIcon,
  ShareIconComponent as ShareIcon,
  AlertTriangleIcon as AlertTriangle
} from '@/components/icons';
import Colors from '@/constants/colors';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import { CalendarEvent } from '@/types/calendar';
import { TodayEvent } from '@/types/events';
import { useTodayEvents, useCalendar } from '@/hooks/useApiData';
import { useUserStore } from '@/store/user-store';
import { useTheme } from '@/contexts/theme-context';
import apiService from '@/lib/api';
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
  const { userProfile } = useUserStore();
  const { theme, isDarkMode } = useTheme();
  const userEmail = userProfile?.email || '';
  
  
  // Fetch events from API using the working endpoints
  const { data: todayEventsData, loading: todayLoading, refetch: refetchToday } = useTodayEvents();
  const { data: calendarEventsData, loading: calendarLoading, refetch: refetchCalendar } = useCalendar();
  
  const todayEvents = todayEventsData?.events || [];
  const calendarEvents = calendarEventsData?.events || [];
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [event, setEvent] = useState<CalendarEvent | TodayEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [savingEvent, setSavingEvent] = useState(false);
  
  // Load saved events from backend API
  useEffect(() => {
    const loadSavedEvents = async () => {
      try {
        const response = await apiService.getSavedEvents();
        const eventIds = response.events?.map((e: any) => e.id) || [];
        setSavedEvents(eventIds);
      } catch (err) {
        console.error('Error loading saved events:', err);
      }
    };
    loadSavedEvents();
  }, []);
  
  const isEventSaved = (eventId: string): boolean => {
    return savedEvents.includes(eventId);
  };
  
  const saveEvent = async (eventId: string) => {
    if (savingEvent) return;
    
    try {
      setSavingEvent(true);
      // Get the event data to save
      const eventToSave = event;
      if (!eventToSave) return;
      
      // Use the backend event ID if available, otherwise use the display ID
      const backendId = (eventToSave as any).backendEventId || eventId;
      
      console.log('💾 Saving event:', {
        displayId: eventId,
        backendId: backendId,
        title: eventToSave.title
      });
      
      // Call backend API to save event
      await apiService.saveUserEvent(backendId, {
        title: eventToSave.title,
        name: eventToSave.title, // Backend requires both title and name
        start_date: 'date' in eventToSave ? eventToSave.date : new Date().toISOString().split('T')[0],
        end_date: 'date' in eventToSave ? eventToSave.date : new Date().toISOString().split('T')[0],
        location: eventToSave.location || null,
        image_url: 'img' in eventToSave ? eventToSave.img : null,
        time: 'time' in eventToSave ? eventToSave.time : null,
        duration: 'duration' in eventToSave ? eventToSave.duration : null,
        description: eventToSave.description || null,
        category: 'category' in eventToSave ? eventToSave.category : null,
        color: 'color' in eventToSave ? eventToSave.color : null,
        isRecurring: 'isRecurring' in eventToSave ? eventToSave.isRecurring : false,
      });
      
      // Update local state
      setSavedEvents([...savedEvents, eventId]);
      Alert.alert('Success', 'Event saved successfully');
    } catch (err) {
      console.error('Error saving event:', err);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    } finally {
      setSavingEvent(false);
    }
  };
  
  const unsaveEvent = async (eventId: string) => {
    if (savingEvent) return;
    
    try {
      setSavingEvent(true);
      
      // Use the backend event ID if available, otherwise use the display ID
      const eventToUnsave = event;
      const backendId = eventToUnsave ? (eventToUnsave as any).backendEventId || eventId : eventId;
      
      console.log('🗑️ Unsaving event:', {
        displayId: eventId,
        backendId: backendId,
        title: eventToUnsave?.title
      });
      
      await apiService.unsaveUserEvent(backendId);
      
      // Update local state
      setSavedEvents(savedEvents.filter(id => id !== eventId));
      Alert.alert('Success', 'Event removed from saved');
    } catch (err) {
      console.error('Error unsaving event:', err);
      Alert.alert('Error', 'Failed to remove event. Please try again.');
    } finally {
      setSavingEvent(false);
    }
  };
  
  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError('No event ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Search in today's events and calendar events
      let foundEvent = todayEvents.find((e: any) => e.id === id) || 
                      calendarEvents.find((e: any) => e.id === id);
      
      if (foundEvent) {
        setEvent(foundEvent as CalendarEvent | TodayEvent);
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
  
  // Fetch event when data is available
  useEffect(() => {
    if (!todayLoading && !calendarLoading) {
      fetchEvent();
    }
  }, [fetchEvent, todayLoading, calendarLoading]);
  
  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchToday(), refetchCalendar()]);
      await fetchEvent();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refetchToday, refetchCalendar, fetchEvent]);
  
  // Check if event is saved
  const saved = event ? isEventSaved(event.id) : false;
  
  // Breadcrumb items with proper Href types
  const breadcrumbItems = [
    { label: 'Home', path: '/' as const },
    { label: 'Events', path: '/calendar' as const },
    { 
      label: event?.title || 'Event Details',
      path: { 
        pathname: '/event/[id]',
        params: { id }
      } as const
    },
  ] as const;
  
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
  const handleSaveToggle = async () => {
    if (!event) return;
    
    if (saved) {
      await unsaveEvent(event.id);
    } else {
      await saveEvent(event.id);
    }
  };
  
  // Handle calendar add
  const handleAddToCalendar = async () => {
    if (!event) return;
    
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Calendar permission is required to add events. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar available on this device.');
        return;
      }
      
      // Parse event date and time
      const eventDate = event.date ? new Date(event.date) : new Date();
      const eventTime = ('time' in event && event.time) || 
                       ('startTime' in event && event.startTime) || 
                       '12:00 PM';
      
      // Parse time string (e.g., "2:00 PM" or "14:00")
      const timeMatch = eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const meridiem = timeMatch[3]?.toUpperCase();
        
        // Convert to 24-hour format if needed
        if (meridiem === 'PM' && hours !== 12) {
          hours += 12;
        } else if (meridiem === 'AM' && hours === 12) {
          hours = 0;
        }
        
        eventDate.setHours(hours, minutes, 0, 0);
      }
      
      // Calculate end time (default to 1 hour duration)
      const duration = ('duration' in event && event.duration) || 60; // duration in minutes
      const endDate = new Date(eventDate.getTime() + duration * 60000);
      
      // Create calendar event details
      const eventDetails = {
        title: event.title,
        startDate: eventDate,
        endDate: endDate,
        location: event.location || '',
        notes: event.description || '',
        timeZone: 'America/Chicago', // Adjust based on your timezone
        alarms: [{ relativeOffset: -30 }], // 30 minutes before
      };
      
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      Alert.alert(
        'Success',
        `"${event.title}" has been added to your calendar!`,
        [{ text: 'OK' }]
      );
      
      console.log('✅ Event added to calendar:', eventId);
    } catch (error) {
      console.error('❌ Error adding event to calendar:', error);
      Alert.alert(
        'Error',
        'Failed to add event to calendar. Please try again.',
        [{ text: 'OK' }]
      );
    }
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
  
  if (loading || todayLoading || calendarLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Event Details</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Event Details</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.centered}>
          <AlertTriangle size={48} color={Colors.error} style={styles.errorIcon} />
          <Text style={[styles.errorText, { color: theme.text }]}>{error || 'Event not found'}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={fetchEvent}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Event Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <BreadcrumbNavigation items={breadcrumbItems} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
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
              <Text style={styles.matchText}>{String(event.relevanceScore)}% Match</Text>
            </View>
          )}
          
          {'isRecurring' in event && event.isRecurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringBadgeText}>Recurring</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.contentContainer, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.title, { color: theme.text }]}>{String(event.title || 'Untitled Event')}</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
              onPress={handleShare}
            >
              <Share2 size={22} color={theme.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, saved && [styles.savedButton, { backgroundColor: theme.primary }], !saved && { backgroundColor: theme.primaryLight }]}
              onPress={handleSaveToggle}
            >
              <Bookmark size={22} color={saved ? Colors.white : theme.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.infoContainer, { backgroundColor: theme.white }]}>
            {'date' in event && event.date && (
              <View style={styles.infoItem}>
                <CalendarIcon size={16} color={theme.textSecondary} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  {formatDate(event.date)}
                </Text>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <Clock size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {'time' in event && event.time ? event.time : 
                 ('startTime' in event && 'endTime' in event) ? `${event.startTime} - ${event.endTime}` : 'Time not specified'}
              </Text>
            </View>
            
            {'duration' in event && event.duration && (
              <View style={styles.infoItem}>
                <Clock size={16} color={theme.textSecondary} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  Duration: {String(event.duration)} minutes
                </Text>
              </View>
            )}
            
            {event.location ? (
              <View style={styles.infoItem}>
                <MapPin size={16} color={theme.textSecondary} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  {String(event.location || '')}
                </Text>
              </View>
            ) : null}
            
            <View style={styles.infoItem}>
              <User size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Organized by: {'organizer' in event ? String(event.organizer || 'Unknown') : 'Unknown'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          {'description' in event && event.description && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>About This Event</Text>
                <Text style={[styles.description, { color: theme.textSecondary }, !showFullDescription && styles.truncatedDescription]}>
                  {String(event.description || '')}
                </Text>
                {event.description.length > 150 && (
                  <TouchableOpacity 
                    style={styles.readMoreButton}
                    onPress={() => setShowFullDescription(!showFullDescription)}
                  >
                    <Text style={[styles.readMoreText, { color: theme.primary }]}>
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </>
          )}
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Event Details</Text>
            
            <View style={[styles.detailsCard, { backgroundColor: theme.primaryLight }]}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <AlertCircle size={20} color={theme.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailTitle, { color: theme.text }]}>Important Information</Text>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>Please bring your student ID for check-in. Refreshments will be provided.</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Users size={20} color={theme.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailTitle, { color: theme.text }]}>Who Should Attend</Text>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {'tags' in event && event.tags && event.tags.length > 0 
                      ? `Students interested in ${event.tags.join(', ')}. All experience levels welcome.`
                      : 'All students are welcome to attend this event.'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          {'tags' in event && event.tags && event.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.tagsTitle, { color: theme.text }]}>Tags:</Text>
              <View style={styles.tagsList}>
                {event.tags.map((tag: string, index: number) => (
                  <View key={`tag-${index}`} style={[styles.tag, { backgroundColor: theme.primaryLight }]}>
                    <Tag size={12} color={theme.primary} />
                    <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.registerButton, { backgroundColor: theme.primary }]}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Register for Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.calendarButton, { borderColor: theme.primary }]}
            onPress={handleAddToCalendar}
          >
            <CalendarPlus size={16} color={theme.primary} style={styles.buttonIcon} />
            <Text style={[styles.calendarButtonText, { color: theme.primary }]}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Error state styles
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  headerRight: {
    width: 24, // Match the back button width for balance
  },
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

