import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bookmark, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import AnimatedCard from '@/components/AnimatedCard';

export default function SavedEventsScreen() {
  const router = useRouter();
  const { todayEvents, savedEvents, unsaveEvent } = useEventsStore();
  
  // Get saved events
  const savedEventsList = todayEvents.filter(event => 
    savedEvents.includes(event.id)
  );
  
  // Handle event press
  const handleEventPress = (id: string) => {
    router.push(`/event/${id}`);
  };
  
  // Handle unsave
  const handleUnsave = (id: string) => {
    unsaveEvent(id);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Render item
  const renderItem = ({ item }: { item: any }) => (
    <AnimatedCard
      style={styles.eventCard}
      onPress={() => handleEventPress(item.id)}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventDateBadge}>
          <Calendar size={12} color={Colors.primary} />
          <Text style={styles.eventDateText}>{formatDate(item.date)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.unsaveButton}
          onPress={() => handleUnsave(item.id)}
        >
          <Bookmark size={18} color={Colors.primary} fill={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
      <Text style={styles.eventLocation} numberOfLines={1}>{item.location}</Text>
    </AnimatedCard>
  );
  
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
        <Text style={styles.headerTitle}>Saved Events</Text>
        <View style={styles.placeholder} />
      </View>
      
      {savedEventsList.length > 0 ? (
        <FlatList
          data={savedEventsList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bookmark size={60} color={Colors.primaryLight} />
          <Text style={styles.emptyTitle}>No Saved Events</Text>
          <Text style={styles.emptyText}>
            Events you save will appear here for easy access
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/calendar')}
          >
            <Text style={styles.browseButtonText}>Browse Events</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 32,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
  },
  eventDateText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  unsaveButton: {
    padding: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  browseButtonText: {
    color: Colors.white,
    fontWeight: '500',
  },
});