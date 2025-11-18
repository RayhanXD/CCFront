import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '@/components/CustomStatusBar';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, RefreshCw, CalendarDays } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTodayEvents, useCalendar } from '@/hooks/useApiData';
import { CalendarEvent } from '@/types/calendar';
import EventCard from '@/components/EventCard';
import { useUserStore } from '@/store/user-store';

export default function AllTodayEventsScreen() {
  const router = useRouter();
  const { userProfile } = useUserStore();
  const userEmail = userProfile?.email || '';
  
  // Use API data hook to fetch today's events
  const { data: eventsData, loading: isLoading, error, refetch } = useTodayEvents();
  
  // Fetch future events using the working POST /calendar endpoint
  const { data: futureEventsData, loading: futureLoading } = useCalendar(userEmail);
  
  const [refreshing, setRefreshing] = useState(false);
  const [sortedEvents, setSortedEvents] = useState<CalendarEvent[]>([]);
  const [sortedFutureEvents, setSortedFutureEvents] = useState<CalendarEvent[]>([]);
  const [showingFutureEvents, setShowingFutureEvents] = useState(false);
  
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
  
  // Helper function to check if a date is in the future
  const isFuture = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
      const dateStr = dateString.split('T')[0];
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      return dateStr > todayStr;
    } catch (error) {
      console.error('Error checking if date is future:', error);
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
  
  // Process and sort events when data changes
  useEffect(() => {
    // Process today's events from API
    const todayEvents = eventsData?.events || [];
    if (todayEvents.length > 0) {
      // API already returns today's events, but double-check and sort by time
      const filtered = filterAndSortEvents(todayEvents);
      setSortedEvents(filtered);
      setShowingFutureEvents(false);
    } else {
      setSortedEvents([]);
      setShowingFutureEvents(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsData?.events]);
  
  // Process future events
  useEffect(() => {
    const allFutureEvents = futureEventsData?.events || [];
    
    if (allFutureEvents.length > 0) {
      // Filter to only future events (not today) and sort by date
      const todayStr = new Date().toISOString().split('T')[0];
      const futureOnly = allFutureEvents
        .filter(event => {
          if (!event.date) return false;
          const eventDateStr = event.date.split('T')[0];
          return eventDateStr > todayStr;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
      
      setSortedFutureEvents(futureOnly);
    } else {
      setSortedFutureEvents([]);
    }
  }, [futureEventsData?.events]);
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        // Refresh future events too if needed
      ]);
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Debug: Log data status
  useEffect(() => {
    if (__DEV__) {
      console.log('📅 Today Events Status:', {
        loading: isLoading,
        error: !!error,
        todayCount: sortedEvents.length,
        futureCount: sortedFutureEvents.length,
        showingFuture: showingFutureEvents
      });
    }
  }, [isLoading, error, sortedEvents.length, sortedFutureEvents.length, showingFutureEvents]);
  
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
        <Text style={styles.headerTitle}>
          {sortedEvents.length > 0 ? 
            `Today's Events (${new Date().toLocaleDateString()})` : 
            'Upcoming Events'}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      {(isLoading || futureLoading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={refetch}
          >
            <RefreshCw size={16} color={Colors.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sortedEvents.length === 0 && sortedFutureEvents.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Calendar size={48} color={Colors.textSecondary} />
          <Text style={styles.noEventsText}>
            {showingFutureEvents && sortedFutureEvents.length === 0
              ? 'No events scheduled for today or in the near future'
              : 'No events scheduled for today'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <RefreshCw size={16} color={Colors.white} />
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (sortedEvents.length === 0 && sortedFutureEvents.length > 0) ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.futureEventsHeader}>
            <CalendarDays size={24} color={Colors.primary} />
            <Text style={styles.futureEventsTitle}>Upcoming Events</Text>
          </View>
          <Text style={styles.noTodayEventsText}>No events scheduled for today. Here are upcoming events:</Text>
          
          <View style={styles.gridContainer}>
            {sortedFutureEvents.map((event, index) => (
              <View key={event.id || `future-event-${index}`} style={styles.eventCardContainer}>
                <EventCard 
                  event={event} 
                  variant="vertical" 
                  showLearnMore={false}
                  showRelevanceScore={true}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.gridContainer}>
            {sortedEvents.map((event, index) => (
              <View key={event.id || `today-event-${index}`} style={styles.eventCardContainer}>
                <EventCard 
                  event={event} 
                  variant="vertical" 
                  showLearnMore={false}
                  showRelevanceScore={true}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Get screen width to calculate grid item width
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with 16px padding on sides and 16px gap

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventCard: {
    width: cardWidth,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventCardContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  eventImageContainer: {
    position: 'relative',
    height: 100,
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventColorTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error || '#e53935',
    textAlign: 'center',
    marginBottom: 16,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEventsText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  noTodayEventsText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  debugButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 20,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  futureEventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    gap: 8,
  },
  futureEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
