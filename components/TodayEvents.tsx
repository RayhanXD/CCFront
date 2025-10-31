import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/theme-context';
import { TodayEvent } from '@/types/events';
import AnimatedCard from './AnimatedCard';
import { useEventsStore } from '@/store/events-store';
import EventCard from './EventCard';

// Combined event type to handle both TodayEvent and CalendarEvent
type DisplayEvent = {
  id: string;
  title: string;
  description?: string;
  location: string;
  imageUrl?: string;
  img?: string; // Added for CalendarEvent compatibility
  relevanceScore?: number;
  // Time properties
  time?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
};

interface TodayEventsProps {
  events?: TodayEvent[];
  onSeeAllPress?: () => void;
  maxEvents?: number;
}

const TodayEvents = ({ events: propEvents, onSeeAllPress, maxEvents = 5 }: TodayEventsProps) => {
  const router = useRouter();
  const { 
    todayEvents: storeEvents, 
    isLoading: storeLoading, 
    error: storeError,
    isUsingFallbackData,
    fetchTodayEvents,
    checkAndUpdateEvents,
    retryFetch
  } = useEventsStore();
  const { theme, isDarkMode } = useTheme();
  
  // Local state for component-specific loading and errors
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Helper function to check if a date is today
  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Helper function to parse time string to Date object
  const parseTimeString = (timeStr: string): Date => {
    if (!timeStr) return new Date(0); // Default to epoch if no time
    
    // Try to handle different time formats
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Handle "10:00 AM" format
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        
        // Convert to 24-hour format if AM/PM is specified
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      }
      
      // If no match, return the current date
      return today;
    } catch (error) {
      console.log('Error parsing time:', error);
      return new Date(); // Return current date/time as fallback
    }
  };
  
  // Filter events to only include today's events and sort them by time
  const filterAndSortEvents = (eventsToProcess: any[]) => {
    // First filter to only include today's events
    const todaysEvents = eventsToProcess.filter(event => {
      const eventDate = 'date' in event ? event.date : null;
      return eventDate ? isToday(eventDate) : false;
    });
    
    // Then sort by time
    return [...todaysEvents].sort((a, b) => {
      // Get time from either time or startTime property
      const timeA = 'time' in a ? a.time : ('startTime' in a ? a.startTime : '');
      const timeB = 'time' in b ? b.time : ('startTime' in b ? b.startTime : '');
      
      // Parse the time strings to Date objects
      const dateA = parseTimeString(timeA);
      const dateB = parseTimeString(timeB);
      
      // Sort by time (ascending)
      return dateA.getTime() - dateB.getTime();
    });
  };
  
  // Combine store events with any prop events, filter and sort them
  const unsortedEvents = propEvents || storeEvents;
  const events = filterAndSortEvents(unsortedEvents);
  const isLoading = propEvents ? isLocalLoading : storeLoading;
  const error = propEvents ? localError : storeError;
  
  const handleRefresh = async () => {
    if (propEvents) {
      // If events are provided as props, we can't refresh
      return;
    }
    
    setIsLocalLoading(true);
    try {
      // Use retryFetch instead of fetchTodayEvents for better error handling
      await retryFetch();
      setLocalError(null); // Clear any local errors on success
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to refresh events');
    } finally {
      setIsLocalLoading(false);
    }
  };
  
  useEffect(() => {
    // If events are provided as props, use those
    if (propEvents && propEvents.length > 0) {
      return;
    }
    
    // Check if we need to update today's events
    checkAndUpdateEvents();
  }, [propEvents]);
  
  // Add an effect to check for updates when the component is focused
  useEffect(() => {
    // This would ideally use a focus listener from navigation
    // For now, we'll just check on mount
    checkAndUpdateEvents();
    
    // Set up an interval to check for date changes (every hour)
    const intervalId = setInterval(() => {
      checkAndUpdateEvents();
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(intervalId);
  }, []);

  const handleEventPress = (id: string) => {
    router.push(`/event/${id}`);
  };

  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      // Always navigate to the today-events screen
      router.push('/today-events');
    }
  };

  // Format time (e.g., "10:00 AM - 12:00 PM")
  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Calendar size={20} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Today's Events</Text>
          {isUsingFallbackData && (
            <View style={styles.fallbackIndicator}>
              <AlertTriangle size={14} color={theme.warning} />
              <Text style={[styles.fallbackText, { color: theme.warning }]}>Offline</Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: theme.primaryLight }]} 
              onPress={handleRefresh}
            >
              <RefreshCw size={16} color={theme.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.seeAllButton} 
            onPress={handleSeeAllPress}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
            <ChevronRight size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <RefreshCw size={16} color={Colors.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events scheduled for today</Text>
          <TouchableOpacity 
            style={styles.viewFutureButton}
            onPress={() => router.push('/today-events')}
          >
            <Text style={styles.viewFutureButtonText}>View Upcoming Events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Show limited number of events */}
          {(propEvents || events)
            .slice(0, maxEvents)
            .map((event) => (
              <AnimatedCard
                key={event.id}
                style={styles.eventCard}
              >
                <EventCard 
                  event={event} 
                  variant="horizontal" 
                  showLearnMore={true}
                  showRelevanceScore={true}
                />
              </AnimatedCard>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fallbackIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  fallbackText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 100,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  eventCard: {
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  errorText: {
    marginBottom: 10,
    color: Colors.error || '#e53935',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  noEventsText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  viewFutureButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  viewFutureButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    height: 36,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  learnMoreButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: 'center',
  },
  learnMoreText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default TodayEvents;