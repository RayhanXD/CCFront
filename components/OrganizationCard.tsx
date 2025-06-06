import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Building2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Organization } from '@/types/campus';
import AnimatedCard from '@/components/AnimatedCard';
import InsightButton from '@/components/InsightButton';
import { useUserStore } from '@/store/user-store';

interface OrganizationCardProps {
  organization: Organization;
  onPress: (id: string) => void;
}

const OrganizationCard = ({ organization, onPress }: OrganizationCardProps) => {
  const { userProfile } = useUserStore();
  
  return (
    <AnimatedCard
      style={styles.container}
      onPress={() => onPress(organization.id)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: organization.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        <InsightButton 
          itemType="organization"
          itemName={organization.name}
          matchPercentage={organization.matchPercentage}
          userProfile={userProfile}
          itemId={organization.id}
        />
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{organization.matchPercentage}%</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Building2 size={14} color={Colors.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{organization.name}</Text>
          <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
            {organization.description}
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.primaryLight,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryLight,
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.matchBadge,
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
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    flex: 1,
  },
});

export default OrganizationCard;