import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Animated 
} from 'react-native';
import { Search, Shuffle, X } from 'lucide-react-native';
import CustomStatusBar from '@/components/CustomStatusBar';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useCalendar, useTodayEvents } from '@/hooks/useApiData';
import OrganizationCard from '@/components/OrganizationCard';
import EventCard from '@/components/EventCard';
import BackToTopButton from '@/components/BackToTopButton';
import { useTheme } from '@/contexts/theme-context';
import ThemedText from '@/components/ThemedText';
import { Organization, Event } from '@/lib/api';
import { organizations as mockOrganizations } from '@/mocks/organizations';
import { useUserStore } from '@/store/user-store';

// Define unified item type for explore page
type ExploreItem = (Organization & { itemType: 'organization' }) | (Event & { itemType: 'event' });

// Map organization data to new API Organization model
const mapOrganizationToApi = (org: any, index?: number): Organization => {
  // Create a more stable but unique ID
  const baseId = org.id || org._id || org.organization_id || org.Title;
  const uniqueId = baseId ? `${baseId}-${index || 0}` : `org-${Date.now()}-${Math.random()}`;
  
  return {
    id: uniqueId,
    title: org.Title || org.title || org.name || org.organization_name || org.club_name || 'Untitled Organization',
    category: org.Category || org.category || org.type || org.club_type || 'General',
    missionPurposeDescription: org['Mission, Purpose, and Organization Description'] || org.missionPurposeDescription || org.description || org.mission || org.purpose || org.about || 'No description available',
    presidentFullName: org["President's Full Name"] || org.presidentFullName || org.president?.name || org.president || org.leader || org.contact_person || 'TBD',
    contactEmail: org['Contact Information Email'] || org.contactEmail || org.email || org.contact_email || org.president_email || 'contact@organization.edu',
    picture: org.Picture || org.picture || org.imageUrl || org.image || org.logo || org.photo || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    major: org.Majors || org.major || org.field || org.department || 'General Studies',
    specificMajors: org['Specific Majors'] ? (typeof org['Specific Majors'] === 'string' ? 
      (org['Specific Majors'].startsWith('[') ? 
        (() => { try { return JSON.parse(org['Specific Majors']); } catch { return [org['Specific Majors']]; } })() : 
        [org['Specific Majors']]) : 
      org['Specific Majors']) : 
      (org.specificMajors || org.majors || org.fields || org.benefits || ['General']),
    
    // Legacy fields for backward compatibility
    name: org.name || org.title,
    description: org.description || org.missionPurposeDescription,
    url: org.url || org.website || org.web_url,
    imageUrl: org.imageUrl || org.image || org.picture,
    matchPercentage: org.matchPercentage || Math.floor(Math.random() * 40) + 60,
    president: org.president || (org.presidentFullName ? { name: org.presidentFullName, role: 'President' } : undefined),
    type: org.type || org.category || 'organization',
    meetingTime: org.meetingTime || org.meeting_time || 'TBD',
    location: org.location || org.meeting_location || 'TBD',
    memberCount: org.memberCount || org.member_count || org.members,
    meetingSchedule: org.meetingSchedule || org.schedule,
    email: org.email || org.contactEmail,
    website: org.website || org.url,
    benefits: org.benefits || org.specificMajors,
    events: org.events
  };
};

export default React.memo(function ExploreScreen() {
  const { userProfile } = useUserStore();
  const userEmail = userProfile?.email || 'thomastito88@gmail.com'; // fallback email
  
  // Use API hooks to fetch calendar events and today events data
  const { data: calendarData, loading: calendarLoading, error: calendarError } = useCalendar(userEmail);
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useTodayEvents();
  
  // Process calendar events as organizations (since we're using calendar endpoint)
  const apiCalendarEvents = calendarData?.events || [];
  const organizations: Organization[] = React.useMemo(() => {
    if (apiCalendarEvents.length > 0) {
      // Transform calendar events to match the Organization interface for display
      const transformed = apiCalendarEvents.map((event: any, index: number) => ({
        id: `calendar-${event.id || event.title || event.name || `event-${index}`}`,
        title: event.title || event.name || 'Untitled Event',
        category: event.category || 'Event',
        missionPurposeDescription: event.description || 'No description available',
        presidentFullName: event.organizer || 'TBD',
        contactEmail: event.contact_email || 'contact@event.edu',
        picture: event.image || event.img || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        major: event.location || 'General',
        specificMajors: event.tags || ['General'],
        // Legacy fields for backward compatibility
        name: event.title || event.name,
        description: event.description,
        url: event.url,
        imageUrl: event.image || event.img,
        matchPercentage: Math.floor(Math.random() * 40) + 60,
        type: 'event',
        meetingTime: event.time || 'TBD',
        location: event.location || 'TBD',
        email: event.contact_email,
        website: event.url,
        benefits: event.tags || ['General'],
        events: []
      }));
      
      return transformed;
    }
    // Fallback to mock data if API returns empty, map to API Organization type
    return mockOrganizations.map((org: any, index: number) => mapOrganizationToApi(org, index));
  }, [apiCalendarEvents]);

  // Process events data
  const apiEvents = eventsData?.events || [];
  const events: Event[] = React.useMemo(() => {
    return apiEvents;
  }, [apiEvents]);

  // Combine organizations and events into unified explore items
  const exploreItems: ExploreItem[] = React.useMemo(() => {
    const orgItems: ExploreItem[] = organizations.map(org => ({ ...org, itemType: 'organization' as const }));
    const eventItems: ExploreItem[] = events.map(event => ({ ...event, itemType: 'event' as const }));
    return [...orgItems, ...eventItems];
  }, [organizations, events]);
  
  const [searchQuery, setSearchQuery] = useState('');
  // Use useRef for values that shouldn't trigger re-renders
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<ExploreItem>>(null);
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  
  // Memoized filtered resources for better performance
  const resources = useMemo(() => {
    if (searchQuery.trim() === '') {
      return exploreItems;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return exploreItems.filter(item => {
      // Search in multiple fields for better results
      let searchableFields: string[] = [];
      
      if (item.itemType === 'organization') {
        const org = item as Organization & { itemType: 'organization' };
        searchableFields = [
          // New model fields
          org.title,
          org.category,
          org.missionPurposeDescription,
          org.presidentFullName,
          org.contactEmail,
          org.major,
          ...(org.specificMajors || []),
          
          // Legacy fields for backward compatibility
          org.name,
          org.description,
          org.type,
          org.location,
          org.meetingTime,
          org.email,
          org.website,
          ...(org.benefits || []),
          org.president?.name,
          org.president?.role
        ].filter((field): field is string => Boolean(field));
      } else if (item.itemType === 'event') {
        const event = item as Event & { itemType: 'event' };
        searchableFields = [
          event.title,
          event.description,
          event.location,
          event.time,
          event.date
        ].filter((field): field is string => Boolean(field));
      }
      
      return searchableFields.some(field => 
        String(field).toLowerCase().includes(query)
      );
    });
  }, [exploreItems, searchQuery]);
  
  // Debug: Log API status
  useEffect(() => {
    if (__DEV__) {
      console.log('🔍 Explore Screen API Status:', {
        calendarLoading,
        eventsLoading,
        calendarError,
        eventsError,
        organizationsCount: organizations.length,
        eventsCount: events.length,
        totalItemsCount: exploreItems.length,
        filteredCount: resources.length,
        searchQuery: searchQuery || 'none'
      });
    }
  }, [calendarLoading, eventsLoading, calendarError, eventsError, organizations.length, events.length, exploreItems.length, resources.length, searchQuery]);
  
  // Memoize the search function - just update query, useEffect handles filtering
  const handleSearch = React.useCallback((text: string) => {
    setSearchQuery(text);
  }, []);
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Randomize resources - we'll need to manage this differently since resources is now computed
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const randomizeResources = () => {
    setShuffleSeed(prev => prev + 1);
  };
  
  // Apply shuffle to resources if shuffle seed has changed
  const shuffledResources = useMemo(() => {
    if (shuffleSeed === 0) return resources;
    return [...resources].sort(() => Math.random() - 0.5);
  }, [resources, shuffleSeed]);
  
  // Handle card press
  const handleCardPress = (id: string, itemType: 'organization' | 'event') => {
    if (itemType === 'organization') {
      // Check if this is a calendar event disguised as organization
      if (id.startsWith('calendar-')) {
        // Extract the original event ID and navigate to event details
        const eventId = id.replace('calendar-', '');
        router.push(`/event/${eventId}`);
      } else {
        // Regular organization, go to calendar
        router.push(`/calendar`);
      }
    } else {
      router.push(`/event/${id}`);
    }
  };
  
  // Scroll to top
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  
  // Render item - handle both organizations and events
  const renderItem = ({ item }: { item: ExploreItem }) => (
    <View style={styles.cardWrapper}>
      {item.itemType === 'organization' ? (
        <OrganizationCard 
          organization={item as Organization} 
          onPress={(id) => handleCardPress(id, 'organization')} 
        />
      ) : (
        <EventCard 
          event={item as Event} 
          variant="vertical"
          showLearnMore={false}
          showRelevanceScore={false}
        />
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <ThemedText variant="h1" weight="bold" style={styles.title}>
          Explore
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.subtitle}>
          Discover resources and opportunities across campus
        </ThemedText>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer, 
          { 
            backgroundColor: theme.inputBackground, 
            borderColor: theme.border 
          }
        ]}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={theme.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={theme.textSecondary} strokeWidth={isDarkMode ? 2.5 : 2} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.randomizeButton, { backgroundColor: theme.primary }]}
          onPress={randomizeResources}
        >
          <Shuffle size={20} color={theme.white} strokeWidth={isDarkMode ? 2.5 : 2} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.resultsCount}>
            {(calendarLoading || eventsLoading) ? 'Loading...' : `${resources.length} ${resources.length === 1 ? 'result' : 'results'}`}
          </ThemedText>
          {(calendarError || eventsError) && (
            <ThemedText variant="bodySmall" color="error" style={styles.errorText}>
              {calendarError && eventsError ? 'Using mock data' : (calendarError ? 'Calendar: mock data' : 'Events: error')}
            </ThemedText>
          )}
          {resources.length > 0 && !(calendarLoading || eventsLoading) && (
            <ThemedText variant="bodySmall" color="secondary" style={styles.randomizeHint}>
              Tap shuffle to randomize
            </ThemedText>
          )}
        </View>
        
        {(calendarLoading || eventsLoading) ? (
          <View style={styles.loadingContainer}>
            <ThemedText variant="body" color="secondary">
              Loading calendar and events...
            </ThemedText>
          </View>
        ) : shuffledResources.length > 0 ? (
          <Animated.FlatList
            ref={flatListRef}
            data={shuffledResources}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <ThemedText variant="body" color="secondary" style={styles.emptyStateText}>
              No resources found matching "{searchQuery}"
            </ThemedText>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
              onPress={clearSearch}
            >
              <ThemedText variant="button" color="inverted" style={styles.emptyStateButtonText}>
                Clear Search
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <BackToTopButton 
        scrollY={scrollY} 
        onPress={scrollToTop} 
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  randomizeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  randomizeHint: {
    fontSize: 14,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48.5%',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  emptyStateButtonText: {
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 8,
  },
});