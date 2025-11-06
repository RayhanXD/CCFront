import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import CustomStatusBar from '@/components/CustomStatusBar';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import { useRouter } from 'expo-router';
import FilterTabs from '@/components/FilterTabs';
import OrganizationCard from '@/components/OrganizationCard';
import TodayEvents from '@/components/TodayEvents';
import { useOrganizations } from '@/hooks/useApiData';
import { Organization } from '@/types/campus';
import { TodayEvent } from '@/types/events';
import { useUserStore } from '@/store/user-store';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/theme-context';
import { config } from '@/lib/config';
import BackToTopButton from '@/components/BackToTopButton';
import Logo from '@/components/Logo';
import NetworkErrorBanner from '@/components/NetworkErrorBanner';
import { MessageSquare } from 'lucide-react-native';
import ThemedText from '@/components/ThemedText';

export default React.memo(function HomeScreen() {
  const router = useRouter();
  
  // Use API data hook to fetch organizations data with retry support
  const { 
    data: orgsData, 
    loading: orgsLoading, 
    error: orgsError, 
    refetch: refetchOrganizations 
  } = useOrganizations();
  
  const filteredOrganizations = orgsData?.organizations || [];
  const { userProfile } = useUserStore();
  
  // Debug: Log API status
  useEffect(() => {
    if (__DEV__) {
      console.log('📊 Organizations API Status:', {
        loading: orgsLoading,
        error: orgsError,
        count: filteredOrganizations.length,
        dataExists: !!orgsData,
        firstOrg: filteredOrganizations[0]?.name || 'none'
      });
    }
  }, [orgsLoading, orgsError, filteredOrganizations.length, orgsData]);
  const { theme, isDarkMode } = useTheme();
  const scrollY = new Animated.Value(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const recommendationsSectionRef = useRef<View>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Handle retry for network errors
  const handleRetry = async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      await refetchOrganizations();
    } catch (err) {
      console.error('Failed to retry:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCardPress = (id: string) => {
    // Navigate to organization details
    router.push(`/organization/${id}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardWrapper}>
      <OrganizationCard 
        organization={item} 
        onPress={handleCardPress} 
      />
    </View>
  );
  
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToRecommendations = () => {
    recommendationsSectionRef.current?.measureLayout(
      scrollViewRef.current?.getInnerViewNode(),
      (x, y) => {
        scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
      },
      () => {}
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomStatusBar />
      
      <ApiStatusIndicator 
        isUsingFallbackData={!!orgsError}
        error={orgsError}
        onRetry={handleRetry}
        isLoading={orgsLoading}
      />
      {/* Network Error Banner */}
      <NetworkErrorBanner 
        isVisible={!!orgsError}
        message={orgsError || 'Network error. Using cached data.'}
        onRetry={handleRetry}
        isRetrying={isRetrying || orgsLoading}
        isMockData={config.USE_MOCK_DATA}
      />
      
      {/* Chat Button */}
      <TouchableOpacity 
        style={[
          styles.chatButton, 
          { 
            backgroundColor: theme.primary,
            shadowColor: isDarkMode ? theme.primary : '#000',
            shadowOpacity: isDarkMode ? 0.5 : 0.3,
            shadowRadius: isDarkMode ? 8 : 3,
            elevation: isDarkMode ? 8 : 5,
          }
        ]}
        onPress={() => router.push('/chatbot')}
      >
        <MessageSquare 
          size={24} 
          color={theme.white} 
          strokeWidth={isDarkMode ? 2.5 : 2}
        />
      </TouchableOpacity>
      
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={[styles.heroSection, { backgroundColor: theme.background }]}>
          <View style={styles.titleContainer}>
            <View style={styles.welcomeContainer}>
              <Logo size={24} />
              <ThemedText variant="body" weight="semibold" color="accent" style={styles.welcomeText}>
                Hi, {userProfile?.name?.split(' ')[0] || 'there'}!
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              <ThemedText key="title-1" variant="h1" weight="bold" style={styles.title}>
                Recommendations{' '}
              </ThemedText>
              <ThemedText key="title-2" variant="h1" weight="bold" style={styles.title}>
                &
              </ThemedText>
              <ThemedText key="title-3" variant="h1" weight="bold" color="accent" style={styles.title}>
                {' '}Opportunities
              </ThemedText>
            </View>
            <ThemedText variant="body" color="secondary" style={styles.subtitle}>
              Discover personalized recommendations tailored to your academic journey
            </ThemedText>
          </View>
        </View>
        
        {/* Today's Top 5 Events Section */}
        <TodayEvents 
          maxEvents={5}
          onSeeAllPress={() => router.push('/today-events')}
        />
        
        <View ref={recommendationsSectionRef} style={styles.recommendationsSection}>
          <ThemedText variant="h3" weight="semibold" style={styles.sectionTitle}>
            Recommended Organizations
          </ThemedText>
          <FilterTabs />
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          {orgsLoading ? (
            <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
              <ThemedText variant="body" color="secondary" style={styles.emptyStateText}>
                Loading organizations...
              </ThemedText>
            </View>
          ) : filteredOrganizations.length > 0 ? (
            <View style={styles.gridContainer}>
              {filteredOrganizations.map((item: Organization, index: number) => (
                <View key={item.id || `org-${index}`} style={styles.cardWrapper}>
                  <OrganizationCard 
                    organization={item} 
                    onPress={handleCardPress} 
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
              <ThemedText variant="body" color="secondary" style={styles.emptyStateText}>
                {orgsError ? 'Using mock data - no organizations available' : 'No recommendations found for this filter.'}
              </ThemedText>
              {orgsError && (
                <TouchableOpacity 
                  style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
                  onPress={handleRetry}
                >
                  <ThemedText variant="button" color="inverted" style={styles.emptyStateButtonText}>
                    Retry
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      
      <BackToTopButton 
        scrollY={scrollY} 
        onPress={scrollToTop} 
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  apiStatusContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    alignSelf: 'center',
    zIndex: 1000,
  },
  container: {
    flex: 1,
  },
  chatButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    zIndex: 999,
  },
  heroSection: {
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    marginBottom: 16,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  cardWrapper: {
    width: '48.5%',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 12,
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
});