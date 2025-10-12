import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Dimensions, ActivityIndicator, Image } from 'react-native';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, RefreshCw, ChevronDown, Calendar as CalendarIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useCalendarStore, useInitializeCalendar } from '@/store/calendar-store';
import { CalendarEvent } from '@/types/calendar';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function CalendarScreen() {
  const { 
    events, 
    isLoading,
    error,
    selectedDate: storeSelectedDate, 
    setSelectedDate,
    fetchEvents 
  } = useCalendarStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [visibleEvents, setVisibleEvents] = useState(3); // Number of events to show initially
  
  // Initialize calendar data
  useInitializeCalendar();
  
  // Ensure selectedDate is a valid Date object
  const selectedDate = storeSelectedDate instanceof Date ? 
    storeSelectedDate : 
    new Date();
  
  // Get current date info
  const today = new Date();
  
  // Format date for display
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Format date for day display
  const formatDayHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  // Handle day selection
  const handleDaySelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };
  
  // Get events for selected date and sort them
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    // Filter events for the selected date
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    
    // Remove duplicate events (same title, time, and location)
    const uniqueEvents: CalendarEvent[] = [];
    const eventKeys = new Set<string>();
    
    filteredEvents.forEach(event => {
      // Create a unique key for each event based on title, time, and location
      const eventKey = `${event.title}-${event.time}-${event.location}`;
      
      // Only add the event if we haven't seen this key before
      if (!eventKeys.has(eventKey)) {
        eventKeys.add(eventKey);
        uniqueEvents.push(event);
      }
    });
    
    // Sort events: today's events first, recurring events last
    return uniqueEvents.sort((a, b) => {
      // If one is recurring and the other isn't, put recurring at the bottom
      if (a.isRecurring && !b.isRecurring) return 1;
      if (!a.isRecurring && b.isRecurring) return -1;
      
      // If both are of the same type (recurring or not), sort by time
      const timeA = a.time.toLowerCase();
      const timeB = b.time.toLowerCase();
      return timeA.localeCompare(timeB);
    });
  };

  const handleAddEvent = () => {
    router.push('/modals/add-event');
  };
  
  const handleRefresh = () => {
    // Get the first and last day of the current month for filtering
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Format dates as YYYY-MM-DD
    const start_date = firstDay.toISOString().split('T')[0];
    const end_date = lastDay.toISOString().split('T')[0];
    
    // Fetch events for the current month
    fetchEvents({ start_date, end_date });
  };
  
  // Fetch events when the month changes
  useEffect(() => {
    handleRefresh();
  }, [currentMonth]);
  
  // Render calendar grid
  const renderCalendarGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    // Add weekday headers with unique keys
    weekdays.forEach((day, index) => {
      days.push(
        <View key={`header-${index}`} style={styles.weekdayHeader}>
          <Text style={styles.weekdayText}>{day}</Text>
        </View>
      );
    });
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = 
        today.getDate() === day && 
        today.getMonth() === month && 
        today.getFullYear() === year;
      
      const isSelected = 
        selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;
      
      // Check if day has events
      const hasEvents = events.some(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === day &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );
      });
      
      days.push(
        <TouchableOpacity 
          key={`day-${day}`} 
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
          ]}
          onPress={() => handleDaySelect(day)}
        >
          <Text 
            style={[
              styles.dayText,
              isToday && styles.todayText,
              isSelected && styles.selectedText,
            ]}
          >
            {day}
          </Text>
          {hasEvents && <View style={styles.eventDot} />}
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.calendarGrid}>{days}</View>;
  };
  
  // Render selected day events
  const renderSelectedDayEvents = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <RefreshCw size={16} color={Colors.white} />
            <Text style={styles.refreshButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const selectedEvents = getEventsForSelectedDate();
    
    if (selectedEvents.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events scheduled for this day</Text>
          <TouchableOpacity 
            style={styles.addEventButton}
            onPress={handleAddEvent}
          >
            <Plus size={16} color={Colors.white} />
            <Text style={styles.addEventButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Show only the visible number of events
    const eventsToShow = selectedEvents.slice(0, visibleEvents);
    const hasMoreEvents = selectedEvents.length > visibleEvents;
    
    return (
      <>
        {eventsToShow.map(event => (
          <View key={event.id} style={styles.eventCard}>
            {event.img ? (
              <View style={styles.eventImageContainer}>
                <Image 
                  source={{ uri: event.img }} 
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                {event.color && (
                  <View style={[styles.eventColorTag, { backgroundColor: event.color }]} />
                )}
                {event.isRecurring && (
                  <View style={styles.recurringBadge}>
                    <Text style={styles.recurringBadgeText}>Recurring</Text>
                  </View>
                )}
              </View>
            ) : event.color ? (
              <>
                <View style={[styles.eventColorBanner, { backgroundColor: event.color }]} />
                {event.isRecurring && (
                  <View style={styles.recurringBadgeAlt}>
                    <Text style={styles.recurringBadgeText}>Recurring</Text>
                  </View>
                )}
              </>
            ) : event.isRecurring ? (
              <View style={styles.recurringBadgeAlt}>
                <Text style={styles.recurringBadgeText}>Recurring</Text>
              </View>
            ) : null}
            
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDuration}>
                  <Text style={styles.eventDurationText}>{event.duration} min</Text>
                </View>
              </View>
              
              <View style={styles.eventDetail}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>{event.time}</Text>
              </View>
              
              {event.description && (
                <Text 
                  style={styles.eventDescription} 
                  numberOfLines={2} 
                  ellipsizeMode="tail"
                >
                  {event.description}
                </Text>
              )}
            </View>
          </View>
        ))}
        
        {hasMoreEvents && (
          <TouchableOpacity 
            style={styles.showMoreButton}
            onPress={() => setVisibleEvents(prev => prev + 5)}
          >
            <Text style={styles.showMoreButtonText}>Show More</Text>
            <ChevronDown size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity 
          style={styles.newEventButton}
          onPress={handleAddEvent}
        >
          <Plus size={18} color={Colors.white} />
          <Text style={styles.newEventButtonText}>New Event</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.currentMonth}>{formatMonth(currentMonth)}</Text>
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={styles.todayButton}
                onPress={goToToday}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToPreviousMonth}
              >
                <ChevronLeft size={20} color={Colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToNextMonth}
              >
                <ChevronRight size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.calendarCard}>
            {renderCalendarGrid()}
          </View>
          
          <View style={styles.eventsSection}>
            <View style={styles.eventsHeader}>
              <Text style={styles.selectedDateText}>
                {selectedDate ? formatDayHeader(selectedDate) : formatDayHeader(today)}
              </Text>
              <View style={styles.calendarBadge}>
                <Text style={styles.calendarBadgeText}>Events</Text>
              </View>
            </View>
            
            <View style={styles.eventsList}>
              {renderSelectedDayEvents()}
            </View>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  newEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  newEventButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  calendarContainer: {
    padding: 20,
    paddingTop: 0,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 4,
  },
  todayButtonText: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 13,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  weekdayHeader: {
    width: '14.28%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  todayCell: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
  },
  todayText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  selectedCell: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    zIndex: 1,
  },
  selectedText: {
    color: Colors.white,
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  eventsSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  calendarBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  calendarBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventImageContainer: {
    position: 'relative',
    height: 120,
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventColorTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  eventColorBanner: {
    height: 4,
    width: '100%',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  eventDuration: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  eventDurationText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 20,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  noEventsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  addEventButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error || '#e53935',
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  refreshButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    gap: 6,
  },
  showMoreButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 14,
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
  recurringBadgeAlt: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    margin: 8,
  },
  recurringBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});