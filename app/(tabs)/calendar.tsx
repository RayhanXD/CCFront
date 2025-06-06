import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useCalendarStore } from '@/store/calendar-store';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function CalendarScreen() {
  const { events, selectedDate: storeSelectedDate, setSelectedDate } = useCalendarStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
  
  // Get events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  const handleAddEvent = () => {
    router.push('/modals/add-event');
  };
  
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
    
    return (
      <>
        {selectedEvents.map(event => (
          <View key={event.id} style={styles.eventCard}>
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
          </View>
        ))}
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
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
});