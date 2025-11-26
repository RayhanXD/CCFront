import React, { useState, useEffect } from 'react';
import CustomStatusBar from '@/components/CustomStatusBar';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon as ChevronLeft, BookmarkIcon as Bookmark, CalendarIconComponent as Calendar, AwardIcon as Award, UsersIcon as Users } from '@/components/icons';
import Colors from '@/constants/colors';
import AnimatedCard from '@/components/AnimatedCard';
import { useDialog } from '@/contexts/dialog-context';
import { useToast } from '@/contexts/toast-context';
import apiService from '@/lib/api';

type TabType = 'events' | 'scholarships' | 'organizations';

export default function SavedItemsScreen() {
  const router = useRouter();
  const { showWarning } = useDialog();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [savedItems, setSavedItems] = useState({
    events: [] as any[],
    scholarships: [] as any[],
    organizations: [] as any[]
  });
  
  // Fetch saved items
  const fetchSavedItems = async () => {
    try {
      setLoading(true);
      const items = await apiService.getSavedItems();
      setSavedItems({
        events: items.personal_events || [],
        scholarships: items.scholarships || [],
        organizations: items.organizations || []
      });
    } catch (error) {
      console.error('Error fetching saved items:', error);
      showToast({
        message: 'Failed to load saved items',
        type: 'error',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSavedItems();
  }, []);
  
  // Get current list based on active tab
  const currentList = savedItems[activeTab];
  
  // Handle item press
  const handleItemPress = (item: any) => {
    console.log('📍 Navigating to item:', item);
    
    if (activeTab === 'events') {
      // Personal events - use the personal-event detail screen
      const eventId = item.uid || item.eventId || item.event_id || item.id;
      console.log('📍 Personal Event ID for navigation:', eventId);
      router.push(`/personal-event/${encodeURIComponent(eventId)}`);
    } else if (activeTab === 'scholarships') {
      const scholarshipId = item.scholarshipId || item.scholarship_id || item.id;
      console.log('📍 Scholarship ID for navigation:', scholarshipId);
      router.push(`/scholarship/${encodeURIComponent(scholarshipId)}`);
    } else if (activeTab === 'organizations') {
      const orgId = item.organizationId || item.organization_id || item.id;
      console.log('📍 Organization ID for navigation:', orgId);
      router.push(`/organization/${encodeURIComponent(orgId)}`);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSavedItems();
    setRefreshing(false);
  };
  
  // Handle unsave
  const handleUnsave = async (id: string) => {
    const item = currentList.find((item: any) => item.id === id);
    const itemType = activeTab === 'events' ? 'event' : activeTab === 'scholarships' ? 'scholarship' : 'organization';
    const itemName = item?.title || item?.name || `this ${itemType}`;
    
    showWarning({
      title: `Remove Saved ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
      message: `Are you sure you want to remove "${itemName}" from your saved items?`,
      buttonText: 'Remove',
      secondaryButtonText: 'Cancel',
      buttonAction: async () => {
        try {
          setRemovingItemId(id);
          
          if (activeTab === 'events') {
            await apiService.unsaveEvent(id);
          } else if (activeTab === 'scholarships') {
            await apiService.unsaveScholarship(id);
          } else if (activeTab === 'organizations') {
            await apiService.unsaveOrganization(id);
          }
          
          await fetchSavedItems();
          showToast({
            message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} removed from saved items`,
            type: 'info',
            position: 'top',
          });
        } catch (error) {
          showToast({
            message: `Failed to remove ${itemType}`,
            type: 'error',
            position: 'top',
          });
        } finally {
          setRemovingItemId(null);
        }
      },
    });
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
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.eventHeader}>
        {activeTab === 'events' && item.date && (
          <View style={styles.eventDateBadge}>
            <Calendar size={12} color={Colors.primary} />
            <Text style={styles.eventDateText}>{formatDate(item.date)}</Text>
          </View>
        )}
        {activeTab === 'scholarships' && (
          <View style={styles.eventDateBadge}>
            <Award size={12} color={Colors.primary} />
            <Text style={styles.eventDateText}>${item.amount?.toLocaleString() || '0'}</Text>
          </View>
        )}
        {activeTab === 'organizations' && (
          <View style={styles.eventDateBadge}>
            <Users size={12} color={Colors.primary} />
            <Text style={styles.eventDateText}>{item.category || 'Organization'}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.unsaveButton}
          onPress={() => handleUnsave(item.id)}
          disabled={removingItemId === item.id}
        >
          {removingItemId === item.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Bookmark size={18} color={Colors.primary} fill={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.eventTitle} numberOfLines={1}>{item.title || item.name}</Text>
      {activeTab === 'events' && (
        <>
          <Text style={styles.eventTime}>{item.time || 'Time TBD'}</Text>
          <Text style={styles.eventLocation} numberOfLines={1}>{item.location || 'Location TBD'}</Text>
        </>
      )}
      {activeTab === 'scholarships' && (
        <>
          <Text style={styles.eventTime}>{item.provider || 'Provider'}</Text>
          <Text style={styles.eventLocation} numberOfLines={1}>Deadline: {item.deadline ? formatDate(item.deadline) : 'TBD'}</Text>
        </>
      )}
      {activeTab === 'organizations' && (
        <>
          <Text style={styles.eventTime}>{item.presidentFullName || item.president?.name || 'President TBD'}</Text>
          <Text style={styles.eventLocation} numberOfLines={1}>{item.major || 'Major TBD'}</Text>
        </>
      )}
    </AnimatedCard>
  );
  
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
        <Text style={styles.headerTitle}>Saved Items</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Calendar size={16} color={activeTab === 'events' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Events ({savedItems.events.length})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'scholarships' && styles.activeTab]}
          onPress={() => setActiveTab('scholarships')}
        >
          <Award size={16} color={activeTab === 'scholarships' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'scholarships' && styles.activeTabText]}>Scholarships ({savedItems.scholarships.length})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'organizations' && styles.activeTab]}
          onPress={() => setActiveTab('organizations')}
        >
          <Users size={16} color={activeTab === 'organizations' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'organizations' && styles.activeTabText]}>Orgs ({savedItems.organizations.length})</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading saved items...</Text>
        </View>
      ) : currentList.length > 0 ? (
        <FlatList
          data={currentList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bookmark size={60} color={Colors.primaryLight} />
          <Text style={styles.emptyTitle}>No Saved {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
          <Text style={styles.emptyText}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} you save will appear here for easy access
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push(activeTab === 'events' ? '/calendar' : activeTab === 'scholarships' ? '/scholarships' : '/explore')}
          >
            <Text style={styles.browseButtonText}>Browse {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
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
