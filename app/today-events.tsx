import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Image, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Clock, Calendar, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import { TodayEvent } from '@/types/events';

export default function AllTodayEventsScreen() {
  const router = useRouter();
  const { 
    todayEvents: events, 
    isLoading, 
    error,
    fetchTodayEvents, 
    checkAndUpdateEvents 
  } = useEventsStore();
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    // Check if we need to update today's events when the screen loads
    checkAndUpdateEvents();
  }, []);
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayEvents();
    setRefreshing(false);
  };
  
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
        <Text style={styles.headerTitle}>Today's Events</Text>
        <View style={styles.placeholder} />
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
            onPress={fetchTodayEvents}
          >
            <RefreshCw size={16} color={Colors.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Calendar size={48} color={Colors.textSecondary} />
          <Text style={styles.noEventsText}>No events scheduled for today</Text>
        </View>
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
            {events.map(event => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <View style={styles.eventImageContainer}>
                  {('imageUrl' in event && event.imageUrl) ? (
                    <Image 
                      source={{ uri: event.imageUrl }} 
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.eventImagePlaceholder, 'color' in event && event.color ? { backgroundColor: event.color as string } : null]}>
                      <Calendar size={24} color={Colors.white} />
                    </View>
                  )}
                  {/* Type guard to ensure color exists and is a string */}
                  {(() => {
                    if ('color' in event && typeof event.color === 'string') {
                      return <View style={[styles.eventColorTag, { backgroundColor: event.color }]} />;
                    }
                    return null;
                  })()}
                </View>
                
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                  
                  {event.location ? (
                    <View style={styles.eventDetail}>
                      <MapPin size={14} color={Colors.textSecondary} />
                      <Text style={styles.eventDetailText} numberOfLines={1}>{event.location}</Text>
                    </View>
                  ) : null}
                  
                  <View style={styles.eventDetail}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.eventDetailText}>
                      {/* Safe time display with proper type checking */}
                      {(() => {
                        // For TodayEvent type
                        if ('startTime' in event && typeof event.startTime === 'string') {
                          if ('endTime' in event && typeof event.endTime === 'string') {
                            return `${event.startTime} - ${event.endTime}`;
                          }
                          return event.startTime;
                        } 
                        // For CalendarEvent type
                        else if ('time' in event && typeof event.time === 'string') {
                          return event.time;
                        }
                        // Fallback
                        return 'Time not specified';
                      })()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
