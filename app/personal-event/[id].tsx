import React, { useState, useEffect } from 'react';
import CustomStatusBar from '@/components/CustomStatusBar';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeftIcon as ChevronLeft, 
  ClockIcon as Clock, 
  MapPinIcon as MapPin, 
  BookmarkIcon as Bookmark,
  CalendarIconComponent as CalendarIcon,
  AlertCircleIcon as AlertCircle,
  FileTextIcon as FileText
} from '@/components/icons';
import Colors from '@/constants/colors';
import apiService from '@/lib/api';
import { format, parseISO } from 'date-fns';

export default function PersonalEventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true); // Assume saved since we're viewing from saved items
  const [unsaving, setUnsaving] = useState(false);
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('No event ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all saved items and find this event
        const savedItems = await apiService.getSavedItems();
        const foundEvent = savedItems.personal_events?.find((e: any) => 
          e.id === id || e.eventId === id || e.event_id === id || e.uid === id
        );
        
        if (foundEvent) {
          console.log('📅 Found personal event:', foundEvent);
          setEvent(foundEvent);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  // Handle unsave
  const handleUnsave = async () => {
    if (!event) return;
    
    Alert.alert(
      'Remove Event',
      `Are you sure you want to remove "${event.title || event.name}" from your saved items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUnsaving(true);
              const eventId = event.eventId || event.event_id || event.id;
              await apiService.unsaveEvent(eventId);
              setIsSaved(false);
              Alert.alert('Success', 'Event removed from saved items', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err) {
              console.error('Error unsaving event:', err);
              Alert.alert('Error', 'Failed to remove event');
            } finally {
              setUnsaving(false);
            }
          }
        }
      ]
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };
  
  // Format time
  const formatTime = (timeString: string) => {
    try {
      // Handle various time formats
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !event) {
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
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <AlertCircle size={60} color={Colors.error} />
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorText}>{error || 'Unable to load event details'}</Text>
          <TouchableOpacity 
            style={styles.backToSavedButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToSavedButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUnsave}
          disabled={unsaving || !isSaved}
        >
          {unsaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Bookmark 
              size={24} 
              color={isSaved ? Colors.primary : Colors.textSecondary} 
              fill={isSaved ? Colors.primary : 'transparent'}
            />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.title || event.name || 'Untitled Event'}</Text>
          {event.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          )}
        </View>
        
        {/* Date & Time */}
        {(event.date || event.start_date) && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <CalendarIcon size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {formatDate(event.date || event.start_date)}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {event.time && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{formatTime(event.time)}</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Location */}
        {event.location && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Description */}
        {event.description && (
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.descriptionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}
        
        {/* Additional Info */}
        {event.duration && (
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoLabel}>Duration:</Text>
            <Text style={styles.additionalInfoValue}>{event.duration}</Text>
          </View>
        )}
        
        {event.organizer && (
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoLabel}>Organizer:</Text>
            <Text style={styles.additionalInfoValue}>{event.organizer}</Text>
          </View>
        )}
        
        {event.isRecurring && (
          <View style={styles.recurringBadge}>
            <Text style={styles.recurringText}>🔄 Recurring Event</Text>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  saveButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backToSavedButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  backToSavedButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 34,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  additionalInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
    fontWeight: '500',
  },
  additionalInfoValue: {
    fontSize: 14,
    color: Colors.text,
  },
  recurringBadge: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  recurringText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
