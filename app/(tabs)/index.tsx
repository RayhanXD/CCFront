import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, StatusBar, Animated, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import FilterTabs from '@/components/FilterTabs';
import OrganizationCard from '@/components/OrganizationCard';
import TodayEvents from '@/components/TodayEvents';
import { useCampusStore } from '@/store/campus-store';
import { useEventsStore } from '@/store/events-store';
import { useUserStore } from '@/store/user-store';
import Colors from '@/constants/colors';
import BackToTopButton from '@/components/BackToTopButton';
import Logo from '@/components/Logo';

export default function HomeScreen() {
  const router = useRouter();
  const { filteredOrganizations } = useCampusStore();
  const { todayEvents } = useEventsStore();
  const { userProfile } = useUserStore();
  const scrollY = new Animated.Value(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const recommendationsSectionRef = useRef<View>(null);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.heroSection}>
          <View style={styles.titleContainer}>
            <View style={styles.welcomeContainer}>
              <Logo size={24} />
              <Text style={styles.welcomeText}>
                Hi, {userProfile?.name?.split(' ')[0] || 'there'}!
              </Text>
            </View>
            <Text style={styles.title}>
              Recommendations <Text style={styles.titleAmp}>&</Text>
              {" "}
              <Text style={styles.titleHighlight}>Opportunities</Text>
            </Text>
            <Text style={styles.subtitle}>
              Discover personalized recommendations tailored to your academic journey
            </Text>
          </View>
        </View>
        
        {/* Today's Top 3 Events Section */}
        <TodayEvents 
          events={todayEvents.slice(0, 3)} 
          onSeeAllPress={scrollToRecommendations}
        />
        
        <View ref={recommendationsSectionRef} style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommended Organizations</Text>
          <FilterTabs />
          
          <View style={styles.divider} />
          
          {filteredOrganizations.length > 0 ? (
            <View style={styles.gridContainer}>
              {filteredOrganizations.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  <OrganizationCard 
                    organization={item} 
                    onPress={handleCardPress} 
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No recommendations found for this filter.
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => useCampusStore.getState().setSelectedFilter('all')}
              >
                <Text style={styles.emptyStateButtonText}>View All</Text>
              </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 36,
  },
  titleAmp: {
    color: Colors.text,
  },
  titleHighlight: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontWeight: '500',
  },
});