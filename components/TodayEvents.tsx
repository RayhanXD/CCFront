import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/theme-context';
import { TodayEvent } from '@/types/events';
import AnimatedCard from './AnimatedCard';
import EventCard from './EventCard';
import { useTodayEvents } from '@/hooks/useApiData';

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

// Component that fetches real data from API
const TodayEvents = React.memo(({ events: propEvents, onSeeAllPress, maxEvents = 5 }: TodayEventsProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Use API data hook to fetch real events
  const { data: apiData, loading: isLoading, error, refetch } = useTodayEvents();
  
  // Use prop events if provided, otherwise use API data
  const events = propEvents || (apiData?.events || []);
  const isUsingFallbackData = !!error;
  
  // Refresh function that actually works
  const retryFetch = async () => {
    await refetch();
  };
  
  // Helper function to check if a date is today
  const isToday = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
      // Handle ISO date strings (YYYY-MM-DD or full ISO)
      const dateStr = dateString.split('T')[0]; // Get just the date part
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      return dateStr === todayStr;
    } catch (error) {
      console.error('Error checking if date is today:', error);
      return false;
    }
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
  
  // Filter and sort the prop events only
  const filteredEvents = filterAndSortEvents(events);
  
  const handleRefresh = async () => {
    // Refresh disabled - component only displays prop events
    console.log('Refresh disabled - component only displays prop events');
  };
  
  // COMPLETELY DISABLED automatic data fetching to prevent infinite loops
  // Components will only display data that is explicitly provided via props
  // or manually triggered by user actions

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
      ) : filteredEvents.length === 0 ? (
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
          {filteredEvents
            .slice(0, maxEvents)
            .map((event, index) => (
              <AnimatedCard
                key={event.id || `event-${index}`}
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
});

// Set display name for debugging
TodayEvents.displayName = 'TodayEvents';

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