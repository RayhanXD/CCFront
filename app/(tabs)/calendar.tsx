import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '@/components/CustomStatusBar';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, ChevronDown, Calendar as CalendarIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useCalendar, useCalendarRange } from '@/hooks/useApiData';
import { CalendarEvent } from '@/types/calendar';
import EventCard from '@/components/EventCard';
import { useTheme } from '@/contexts/theme-context';
import ThemedText from '@/components/ThemedText';
import { useUserStore } from '@/store/user-store';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function CalendarScreen() {
  const { userProfile } = useUserStore();
  const userEmail = userProfile?.email || '';
  
  const { theme, isDarkMode } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [visibleEvents, setVisibleEvents] = useState(3); // Number of events to show initially
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Use API data hook to fetch real calendar events with 3-month pagination
  const { data: calendarData, loading: isLoading, error, refetch } = useCalendar(userEmail, currentMonth);
  const events = Array.isArray(calendarData?.events) ? calendarData.events : [];
  const hasMoreEvents = calendarData?.hasMore || false;
  
  // Get current date info
  const today = new Date();
  
  // Debug logging (commented out to prevent text rendering issues)
  // console.log('📅 Calendar Debug:', {
  //   userEmail,
  //   calendarData,
  //   events: events.length,
  //   hasMoreEvents,
  //   isLoading,
  //   error,
  //   firstEvent: events[0] ? {
  //     title: String(events[0].title || 'No title'),
  //     date: String(events[0].date || 'No date')
  //   } : null,
  //   selectedDate: selectedDate?.toDateString(),
  //   today: today.toDateString(),
  //   currentMonth: currentMonth.toDateString()
  // });
  
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
    try {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      
      // Validate the new date
      if (isNaN(newMonth.getTime())) {
        console.error('Invalid date created in goToPreviousMonth');
        return;
      }
      
      setCurrentMonth(newMonth);
      // Reset selected date to first day of new month to avoid invalid selections
      setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
    } catch (error) {
      console.error('Error in goToPreviousMonth:', error);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    try {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      
      // Validate the new date
      if (isNaN(newMonth.getTime())) {
        console.error('Invalid date created in goToNextMonth');
        return;
      }
      
      setCurrentMonth(newMonth);
      // Reset selected date to first day of new month to avoid invalid selections
      setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
    } catch (error) {
      console.error('Error in goToNextMonth:', error);
    }
  };
  
  // Go to today
  const goToToday = () => {
    try {
      const today = new Date();
      setCurrentMonth(today);
      setSelectedDate(today);
    } catch (error) {
      console.error('Error in goToToday:', error);
    }
  };
  
  // Handle day selection
  const handleDaySelect = (day: number) => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Validate the day is within the month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      if (day < 1 || day > daysInMonth) {
        console.warn(`Invalid day selected: ${day} for month ${month + 1}/${year}`);
        return;
      }
      
      const newDate = new Date(year, month, day);
      
      // Validate the created date
      if (isNaN(newDate.getTime())) {
        console.warn(`Invalid date created: ${year}-${month + 1}-${day}`);
        return;
      }
      
      setSelectedDate(newDate);
    } catch (error) {
      console.error('Error in handleDaySelect:', error, 'day:', day);
    }
  };
  
  // Get events for selected date and sort them
  const getEventsForSelectedDate = () => {
    // console.log('🗓️ getEventsForSelectedDate called:', {
    //   selectedDate,
    //   totalEvents: events.length,
    //   eventsData: events.slice(0, 2) // Show first 2 events for debugging
    // });
    
    if (!selectedDate) {
      // console.log('❌ No selectedDate, returning empty array');
      return [];
    }
    
    // Filter events for the selected date
    const filteredEvents = events.filter(event => {
      try {
        if (!event || !event.date) return false;
        
        const eventDate = new Date(event.date);
        
        // Check if the date is valid
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid event date:', event.date, 'for event:', event.title);
          return false;
        }
        
        const matches = (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
        
        return matches;
      } catch (error) {
        console.error('Error filtering event:', error, 'event:', event);
        return false;
      }
    });
    
    // console.log('🔍 Filtered events for selected date:', filteredEvents.length);
    
    // Remove duplicate events (same title, time, and location)
    const uniqueEvents: CalendarEvent[] = [];
    const eventKeys = new Set<string>();
    
    filteredEvents.forEach(event => {
      try {
        if (!event) return;
        
        // Create a unique key for each event based on title, time, and location
        const eventKey = `${String(event.title || '')}-${String(event.time || '')}-${String(event.location || '')}`;
        
        // Only add the event if we haven't seen this key before
        if (!eventKeys.has(eventKey)) {
          eventKeys.add(eventKey);
          uniqueEvents.push(event);
        }
      } catch (error) {
        console.error('Error processing event for deduplication:', error, 'event:', event);
      }
    });
    
    // Sort events: today's events first, recurring events last
    return uniqueEvents.sort((a, b) => {
      try {
        if (!a || !b) return 0;
        
        // If one is recurring and the other isn't, put recurring at the bottom
        if (a.isRecurring && !b.isRecurring) return 1;
        if (!a.isRecurring && b.isRecurring) return -1;
        
        // If both are of the same type (recurring or not), sort by time
        const timeA = String(a.time || '').toLowerCase();
        const timeB = String(b.time || '').toLowerCase();
        return timeA.localeCompare(timeB);
      } catch (error) {
        console.error('Error sorting events:', error, 'events:', a, b);
        return 0;
      }
    });
  };

  const handleAddEvent = () => {
    router.push('/modals/add-event');
  };
  
  const handleRefresh = () => {
    try {
      // Get the first and last day of the current month for filtering
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Validate the dates
      if (isNaN(firstDay.getTime()) || isNaN(lastDay.getTime())) {
        console.error('Invalid dates created in handleRefresh');
        return;
      }
      
      // Format dates as YYYY-MM-DD
      const start_date = firstDay.toISOString().split('T')[0];
      const end_date = lastDay.toISOString().split('T')[0];
      
      // Fetch events for the current month
      refetch();
    } catch (error) {
      console.error('Error in handleRefresh:', error);
    }
  };
  
  // Fetch events when the month changes
  useEffect(() => {
    handleRefresh();
  }, [currentMonth]);
  
  // Render calendar grid
  const renderCalendarGrid = () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        console.error('Invalid year or month in renderCalendarGrid:', year, month);
        return <View style={styles.calendarGrid}><ThemedText>Error loading calendar</ThemedText></View>;
      }
      
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
        try {
          if (!event || !event.date) return false;
          const eventDate = new Date(event.date);
          
          // Check if the date is valid
          if (isNaN(eventDate.getTime())) {
            return false;
          }
          
          return (
            eventDate.getDate() === day &&
            eventDate.getMonth() === month &&
            eventDate.getFullYear() === year
          );
        } catch (error) {
          console.error('Error checking hasEvents for day:', day, 'event:', event, 'error:', error);
          return false;
        }
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
            {String(day)}
          </ThemedText>
          {hasEvents && <View style={[styles.eventDot, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.calendarGrid}>{days}</View>;
    } catch (error) {
      console.error('Error in renderCalendarGrid:', error);
      return <View style={styles.calendarGrid}><ThemedText>Error loading calendar</ThemedText></View>;
    }
  };
  
  // Render selected day events
  const renderSelectedDayEvents = () => {
    try {
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
            Error: {String(error || 'Unknown error')}
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
        {eventsToShow.map((event, index) => (
          <EventCard
            key={String(event.id || `event-${index}`)}
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
    } catch (error) {
      console.error('Error in renderSelectedDayEvents:', error);
      return (
        <View style={styles.errorContainer}>
          <ThemedText variant="body" color="error">
            Error loading events
          </ThemedText>
        </View>
      );
    }
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
              {String(formatMonth(currentMonth))}
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
                {String(selectedDate ? formatDayHeader(selectedDate) : formatDayHeader(today))}
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