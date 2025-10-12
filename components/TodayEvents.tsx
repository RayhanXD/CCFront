import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { Calendar, Clock, MapPin, ChevronRight, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { TodayEvent } from '@/types/events';
import { CalendarEvent } from '@/types/calendar';
import AnimatedCard from './AnimatedCard';
import InsightButton from './InsightButton';
import { useUserStore } from '@/store/user-store';
import { useEventsStore } from '@/store/events-store';
import { apiService } from '@/lib/api';

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
  const { userProfile } = useUserStore();
  const { 
    todayEvents: storeEvents, 
    isLoading: storeLoading, 
    error: storeError,
    fetchTodayEvents,
    checkAndUpdateEvents
  } = useEventsStore();
  
  // Local state for component-specific loading and errors
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Combine store events with any prop events
  const events = propEvents || storeEvents;
  const isLoading = propEvents ? isLocalLoading : storeLoading;
  const error = propEvents ? localError : storeError;
  
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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Calendar size={18} color={Colors.primary} style={styles.titleIcon} />
          <Text style={styles.title}>Today's Top {maxEvents} Events</Text>
        </View>
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={handleSeeAllPress}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
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
            onPress={() => propEvents ? null : fetchTodayEvents()}
          >
            <RefreshCw size={16} color={Colors.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events scheduled for today</Text>
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
            .map((event: DisplayEvent | TodayEvent) => (
          <AnimatedCard
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleEventPress(event.id)}
          >
            <View style={styles.eventImageContainer}>
              {/* Use imageUrl or img if available, otherwise show placeholder */}
              {('imageUrl' in event && event.imageUrl) || ('img' in event && event.img) ? (
                <Image 
                  source={{ uri: ('imageUrl' in event && event.imageUrl) ? event.imageUrl : 
                    // Type guard to ensure img exists
                    ('img' in event ? event.img : undefined) }} 
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.eventImage, styles.eventImagePlaceholder, 
                  // Use color from event if available
                  'color' in event && event.color ? {backgroundColor: event.color as string} : null
                ]}>
                  <Calendar size={32} color={Colors.primary} />
                </View>
              )}
              {/* Show relevance score only for TodayEvent type */}
              {'relevanceScore' in event && event.relevanceScore && (
                <>
                  <InsightButton 
                    itemType="event"
                    itemName={event.title}
                    matchPercentage={event.relevanceScore}
                    userProfile={userProfile}
                    itemId={event.id}
                  />
                  <View style={styles.relevanceBadge}>
                    <Text style={styles.relevanceText}>{event.relevanceScore}% Match</Text>
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{event.title}</Text>
              <Text style={styles.eventDescription} numberOfLines={2} ellipsizeMode="tail">{event.description}</Text>
              
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventDetailText} numberOfLines={1} ellipsizeMode="tail">
                    {/* Handle different time formats */}
                    {'time' in event && event.time ? event.time : 
                     ('startTime' in event && 'endTime' in event && event.startTime && event.endTime) ? 
                      formatTime(event.startTime, event.endTime) : 'Time not specified'}
                  </Text>
                </View>
                
                {event.location ? (
                  <View style={styles.eventDetail}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.eventDetailText} numberOfLines={1} ellipsizeMode="tail">
                      {event.location}
                    </Text>
                  </View>
                ) : null}
              </View>
              
              <TouchableOpacity style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
  eventImageContainer: {
    position: 'relative',
    height: 120,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryLight,
  },
  eventImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
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
  },
  relevanceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  relevanceText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 10,
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