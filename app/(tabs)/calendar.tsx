import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import CustomStatusBar from '@/components/CustomStatusBar';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, ChevronDown, Calendar as CalendarIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useCalendarEvents } from '@/hooks/useApiData';
import { CalendarEvent } from '@/types/calendar';
import EventCard from '@/components/EventCard';
import { useTheme } from '@/contexts/theme-context';
import ThemedText from '@/components/ThemedText';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function CalendarScreen() {
  // Use API data hook to fetch real calendar events
  const { data: calendarData, loading: isLoading, error, refetch } = useCalendarEvents();
  const events = calendarData?.events || [];
  
  const { theme, isDarkMode } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [visibleEvents, setVisibleEvents] = useState(3); // Number of events to show initially
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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
    refetch();
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
          <ThemedText 
            variant="caption" 
            weight="semibold" 
            color="secondary" 
            style={styles.weekdayText}
          >
            {day}
          </ThemedText>
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
            isToday && [styles.todayCell, { backgroundColor: theme.primaryLight }],
            isSelected && [styles.selectedCell, { backgroundColor: theme.primary }],
          ]}
          onPress={() => handleDaySelect(day)}
        >
          <ThemedText 
            variant="body" 
            style={[
              styles.dayText,
              isToday && [styles.todayText, { color: theme.primary }],
              isSelected && [styles.selectedText, { color: theme.white }],
            ]}
          >
            {day}
          </ThemedText>
          {hasEvents && <View style={[styles.eventDot, { backgroundColor: theme.primary }]} />}
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
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText variant="body" color="secondary" style={styles.loadingText}>
            Loading events...
          </ThemedText>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ThemedText variant="body" color="error" style={styles.errorText}>
            Error: {error}
          </ThemedText>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: theme.primary }]}
            onPress={handleRefresh}
          >
            <RefreshCw size={16} color={theme.white} strokeWidth={isDarkMode ? 2.5 : 2} />
            <ThemedText variant="button" color="inverted" style={styles.refreshButtonText}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    
    const selectedEvents = getEventsForSelectedDate();
    
    if (selectedEvents.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <ThemedText variant="body" color="secondary" style={styles.noEventsText}>
            No events scheduled for this day
          </ThemedText>
          <TouchableOpacity 
            style={[styles.addEventButton, { backgroundColor: theme.primary }]}
            onPress={handleAddEvent}
          >
            <Plus size={16} color={theme.white} strokeWidth={isDarkMode ? 2.5 : 2} />
            <ThemedText variant="button" color="inverted" style={styles.addEventButtonText}>
              Add Event
            </ThemedText>
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
          <EventCard
            key={event.id}
            event={event}
            variant="calendar"
            showLearnMore={false}
            showRelevanceScore={false}
          />
        ))}
        
        {hasMoreEvents && (
          <TouchableOpacity 
            style={[styles.showMoreButton, { backgroundColor: theme.primaryLight }]}
            onPress={() => setVisibleEvents(prev => prev + 5)}
          >
            <ThemedText variant="button" color="accent" style={styles.showMoreButtonText}>
              Show More
            </ThemedText>
            <ChevronDown size={16} color={theme.primary} strokeWidth={isDarkMode ? 2.5 : 2} />
          </TouchableOpacity>
        )}
      </>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <ThemedText variant="h1" weight="bold" style={styles.headerTitle}>
          Calendar
        </ThemedText>
        <TouchableOpacity 
          style={[styles.newEventButton, { backgroundColor: theme.primary }]}
          onPress={handleAddEvent}
        >
          <Plus size={18} color={theme.white} strokeWidth={isDarkMode ? 2.5 : 2} />
          <ThemedText variant="button" color="inverted" style={styles.newEventButtonText}>
            New Event
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <ThemedText variant="h3" weight="semibold" style={styles.currentMonth}>
              {formatMonth(currentMonth)}
            </ThemedText>
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={[styles.todayButton, { borderColor: theme.border }]}
                onPress={goToToday}
              >
                <ThemedText variant="bodySmall" weight="medium" style={styles.todayButtonText}>
                  Today
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, { borderColor: theme.border }]}
                onPress={goToPreviousMonth}
              >
                <ChevronLeft size={20} color={theme.text} strokeWidth={isDarkMode ? 2.5 : 2} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, { borderColor: theme.border }]}
                onPress={goToNextMonth}
              >
                <ChevronRight size={20} color={theme.text} strokeWidth={isDarkMode ? 2.5 : 2} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.calendarCard, { 
            backgroundColor: theme.cardBackground,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOpacity: isDarkMode ? 0.3 : 0.05,
            elevation: isDarkMode ? 4 : 2,
          }]}>
            {renderCalendarGrid()}
          </View>
          
          <View style={[styles.eventsSection, { 
            backgroundColor: theme.cardBackground,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOpacity: isDarkMode ? 0.3 : 0.05,
            elevation: isDarkMode ? 4 : 2,
          }]}>
            <View style={styles.eventsHeader}>
              <ThemedText variant="h4" weight="semibold" style={styles.selectedDateText}>
                {selectedDate ? formatDayHeader(selectedDate) : formatDayHeader(today)}
              </ThemedText>
              <View style={[styles.calendarBadge, { backgroundColor: theme.primaryLight }]}>
                <ThemedText variant="caption" weight="medium" color="accent" style={styles.calendarBadgeText}>
                  Events
                </ThemedText>
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
  },
  newEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  newEventButtonText: {
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
    marginRight: 4,
  },
  todayButtonText: {
    fontWeight: '500',
    fontSize: 13,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: {
    borderRadius: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
    textAlign: 'center',
  },
  todayCell: {
    borderRadius: 20,
  },
  todayText: {
    fontWeight: '600',
  },
  selectedCell: {
    borderRadius: 20,
    zIndex: 1,
  },
  selectedText: {
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventsSection: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 16,
  },
  calendarBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  calendarBadgeText: {
    fontSize: 12,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
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
    flex: 1,
    marginRight: 8,
  },
  eventDuration: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  eventDurationText: {
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
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
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
    textAlign: 'center',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  addEventButtonText: {
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
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  refreshButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    gap: 6,
  },
  showMoreButtonText: {
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
    fontSize: 12,
    fontWeight: '500',
  },
});