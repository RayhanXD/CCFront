import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ClockIcon as Clock, MapPinIcon as MapPin } from '@/components/icons';
import Colors from '@/constants/colors';
import { Organization } from '@/lib/api';
import AnimatedCard from '@/components/AnimatedCard';
import InsightButton from '@/components/InsightButton';
import OptimizedImage from '@/components/OptimizedImage';
import { useUserStore } from '@/store/user-store';
import { useTheme } from '@/contexts/theme-context';
import { getStockPhotoByIndex } from '@/constants/images';

interface OrganizationCardProps {
  organization: Organization;
  onPress: (id: string) => void;
  index?: number;
}

const OrganizationCard = ({ organization, onPress, index = 0 }: OrganizationCardProps) => {
  const { userProfile } = useUserStore();
  const { theme, isDarkMode } = useTheme();
  const [imageError, setImageError] = React.useState(false);
  
  // Use stock photo as fallback if no image URL or if image fails to load
  const imageSource = useMemo(() => {
    if (!imageError && (organization.picture || organization.imageUrl)) {
      return { uri: organization.picture || organization.imageUrl };
    }
    // Use stock photo based on index for consistency
    return getStockPhotoByIndex(index);
  }, [organization.picture, organization.imageUrl, index, imageError]);
  
  return (
    <AnimatedCard
      style={[styles.container, { 
        backgroundColor: theme.cardBackground,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOpacity: isDarkMode ? 0.3 : 0.05,
        elevation: isDarkMode ? 4 : 2,
      }]}
      onPress={() => onPress(organization.id)}
    >
      <View style={[styles.imageContainer, { backgroundColor: isDarkMode ? theme.primaryDark : theme.primaryLight }]}>
        {typeof imageSource === 'number' ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <OptimizedImage
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            onError={() => setImageError(true)}
          />
        )}
        <InsightButton 
          itemType="organization"
          itemName={organization.title || organization.name || 'Organization'}
          matchPercentage={organization.matchPercentage || 0}
          userProfile={userProfile}
          itemId={organization.id}
        />
        <View style={[styles.matchBadge, { backgroundColor: theme.matchBadge }]}>
          <Text style={styles.matchText}>{organization.matchPercentage || 0}%</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2} ellipsizeMode="tail">
            {organization.title || organization.name || 'Untitled Organization'}
          </Text>
          
          <Text style={[styles.category, { color: theme.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
            {organization.category}
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Clock size={12} color={isDarkMode ? theme.textSecondary : '#666666'} strokeWidth={isDarkMode ? 2.5 : 2} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
                {organization.major}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MapPin size={12} color={isDarkMode ? theme.textSecondary : '#666666'} strokeWidth={isDarkMode ? 2.5 : 2} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
                {organization.presidentFullName}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    height: 220,
  },
  imageContainer: {
    position: 'relative',
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  matchText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
    flex: 1,
    flexDirection: 'column',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  infoContainer: {
    flex: 1,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(OrganizationCard);