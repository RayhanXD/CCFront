import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { CalendarEvent } from '@/types/calendar';
import { TodayEvent } from '@/types/events';
import InsightButton from './InsightButton';
import { useUserStore } from '@/store/user-store';

// Combined event type to handle both TodayEvent and CalendarEvent
export type DisplayEvent = {
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
  duration?: number;
  date?: string;
  color?: string;
  isRecurring?: boolean;
};

interface EventCardProps {
  event: DisplayEvent | CalendarEvent | TodayEvent;
  variant?: 'horizontal' | 'vertical' | 'calendar';
  showLearnMore?: boolean;
  showRelevanceScore?: boolean;
}

const EventCard = ({ 
  event, 
  variant = 'horizontal', 
  showLearnMore = true,
  showRelevanceScore = true
}: EventCardProps) => {
  const router = useRouter();
  const { userProfile } = useUserStore();
  
  // Helper function to parse time string to Date object
  const parseTimeString = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    
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
      
      return null;
    } catch (error) {
      console.log('Error parsing time:', error);
      return null;
    }
  };
  
  // Format time based on available properties
  const formatTime = () => {
    if ('time' in event && event.time) {
      return event.time;
    } else if ('startTime' in event && 'endTime' in event && event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    return 'Time not specified';
  };
  
  // Check if event is starting soon (within the next hour)
  const isStartingSoon = (): boolean => {
    const now = new Date();
    const timeStr = 'time' in event ? event.time : ('startTime' in event ? event.startTime : null);
    
    if (!timeStr) return false;
    
    const eventTime = parseTimeString(timeStr);
    if (!eventTime) return false;
    
    // Calculate time difference in minutes
    const diffMs = eventTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    // Return true if event starts within the next 60 minutes and hasn't started yet
    return diffMinutes >= 0 && diffMinutes <= 60;
  };
  
  // Get image URL from either imageUrl or img property
  const getImageUrl = () => {
    if ('imageUrl' in event && event.imageUrl) {
      return event.imageUrl;
    } else if ('img' in event && event.img) {
      return event.img;
    }
    return null;
  };
  
  // Handle event press - navigate to event detail
  const handleEventPress = () => {
    router.push(`/event/${event.id}`);
  };
  
  const imageUrl = getImageUrl();
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        variant === 'vertical' ? styles.verticalCard : 
        variant === 'calendar' ? styles.calendarCard : 
        styles.horizontalCard
      ]}
      onPress={handleEventPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.imageContainer,
        variant === 'vertical' ? styles.verticalImageContainer : 
        variant === 'calendar' ? styles.calendarImageContainer : 
        styles.horizontalImageContainer
      ]}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.eventImage, 
            styles.eventImagePlaceholder, 
            'color' in event && event.color ? {backgroundColor: event.color} : null
          ]}>
            <Calendar size={variant === 'vertical' ? 24 : 32} color={Colors.primary} />
          </View>
        )}
        
        {/* Color tag */}
        {('color' in event && event.color) ? (
          <View style={[styles.eventColorTag, { backgroundColor: event.color }]} />
        ) : null}
        
        {/* Recurring badge */}
        {('isRecurring' in event && event.isRecurring) ? (
          <View style={styles.recurringBadge}>
            <Text style={styles.recurringBadgeText}>Recurring</Text>
          </View>
        ) : null}
        
        {/* Starting soon badge */}
        {isStartingSoon() ? (
          <View style={styles.startingSoonBadge}>
            <Text style={styles.startingSoonText}>Starting soon</Text>
          </View>
        ) : null}
        
        {/* Relevance score badge */}
        {(showRelevanceScore && 'relevanceScore' in event && event.relevanceScore) ? (
          <>
            <InsightButton 
              itemType="event"
              itemName={String(event.title || 'Event')}
              matchPercentage={Number(event.relevanceScore || 0)}
              userProfile={userProfile}
              itemId={String(event.id || '')}
            />
            <View style={styles.relevanceBadge}>
              <Text style={styles.relevanceText}>{String(event.relevanceScore)}% Match</Text>
            </View>
          </>
        ) : null}
      </View>
      
      <View style={[
        styles.content,
        variant === 'vertical' ? styles.verticalContent : 
        variant === 'calendar' ? styles.calendarContent : 
        styles.horizontalContent
      ]}>
        <View style={styles.topContent}>
          <View style={styles.titleContainer}>
            <Text 
              style={styles.eventTitle} 
              numberOfLines={variant === 'calendar' ? 1 : 2} 
              ellipsizeMode="tail"
            >
              {String(event.title || 'Untitled Event')}
            </Text>
            
            {(variant === 'calendar' && 'duration' in event && event.duration) ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{String(event.duration)} min</Text>
              </View>
            ) : null}
          </View>
          
          {(variant !== 'calendar' && 'description' in event && event.description) ? (
            <Text 
              style={styles.eventDescription} 
              numberOfLines={2} 
              ellipsizeMode="tail"
            >
              {String(event.description || '')}
            </Text>
          ) : null}
          
          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.eventDetailText} numberOfLines={1} ellipsizeMode="tail">
                {String(formatTime() || 'Time not specified')}
              </Text>
            </View>
            
            {event.location ? (
              <View style={styles.eventDetail}>
                <MapPin size={14} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText} numberOfLines={1} ellipsizeMode="tail">
                  {String(event.location || '')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        
        {(showLearnMore && variant !== 'calendar') ? (
          <TouchableOpacity style={styles.learnMoreButton} onPress={handleEventPress}>
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Horizontal card styles (for Today's Top 5 Events)
  horizontalCard: {
    width: 280,
    height: 240, // Fixed height for consistent sizing
    marginRight: 12,
  },
  horizontalImageContainer: {
    height: 120,
  },
  horizontalContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Vertical card styles (for Today's Events page)
  verticalCard: {
    marginBottom: 16,
  },
  verticalImageContainer: {
    height: 100,
  },
  verticalContent: {
    padding: 12,
  },
  
  // Calendar card styles
  calendarCard: {
    backgroundColor: Colors.background,
    marginBottom: 12,
  },
  calendarImageContainer: {
    height: 120,
  },
  calendarContent: {
    padding: 16,
  },
  
  // Common styles
  imageContainer: {
    position: 'relative',
    width: '100%',
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
  eventColorTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
    height: 36, // Fixed height for 2 lines
    overflow: 'hidden',
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
    color: Colors.textSecondary,
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
  recurringBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recurringBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  startingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  startingSoonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  durationBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  durationText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  topContent: {
    flex: 1,
  },
});

export default EventCard;
