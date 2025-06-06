import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { TodayEvent } from '@/types/events';
import AnimatedCard from './AnimatedCard';
import InsightButton from './InsightButton';
import { useUserStore } from '@/store/user-store';

interface TodayEventsProps {
  events: TodayEvent[];
  onSeeAllPress?: () => void;
}

const TodayEvents = ({ events, onSeeAllPress }: TodayEventsProps) => {
  const router = useRouter();
  const { userProfile } = useUserStore();

  const handleEventPress = (id: string) => {
    router.push(`/event/${id}`);
  };

  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      router.push('/calendar');
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
          <Text style={styles.title}>Today's Top 3 Events</Text>
        </View>
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={handleSeeAllPress}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map((event) => (
          <AnimatedCard
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleEventPress(event.id)}
          >
            <View style={styles.eventImageContainer}>
              <Image 
                source={{ uri: event.imageUrl }} 
                style={styles.eventImage}
                resizeMode="cover"
              />
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
            </View>
            
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{event.title}</Text>
              <Text style={styles.eventDescription} numberOfLines={2} ellipsizeMode="tail">{event.description}</Text>
              
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventDetailText} numberOfLines={1} ellipsizeMode="tail">
                    {formatTime(event.startTime, event.endTime)}
                  </Text>
                </View>
                
                <View style={styles.eventDetail}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventDetailText} numberOfLines={1} ellipsizeMode="tail">
                    {event.location}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        ))}
      </ScrollView>
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