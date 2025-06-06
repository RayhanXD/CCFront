import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Award, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Scholarship } from '@/types/scholarship';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '@/components/AnimatedCard';
import InsightButton from '@/components/InsightButton';
import { useUserStore } from '@/store/user-store';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onPress: (id: string) => void;
}

export const ScholarshipCard = ({ scholarship, onPress }: ScholarshipCardProps) => {
  const { userProfile } = useUserStore();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(scholarship.deadline);
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
  const isPast = daysRemaining < 0;

  return (
    <AnimatedCard
      style={styles.container}
      onPress={() => onPress(scholarship.id)}
    >
      <LinearGradient
        colors={[Colors.primaryLight, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <InsightButton 
          itemType="scholarship"
          itemName={scholarship.name}
          matchPercentage={scholarship.matchPercentage}
          userProfile={userProfile}
          itemId={scholarship.id}
        />
        
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{scholarship.matchPercentage}%</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatCurrency(scholarship.amount)}</Text>
          {scholarship.renewable && (
            <Text style={styles.renewable}>Renewable</Text>
          )}
        </View>
      </LinearGradient>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{scholarship.name}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detail}>
            <Award size={14} color={Colors.primary} />
            <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
              {scholarship.type.charAt(0).toUpperCase() + scholarship.type.slice(1)}
            </Text>
          </View>
          
          <View style={styles.detail}>
            <Calendar size={14} color={isUrgent ? Colors.primary : Colors.textSecondary} />
            <Text 
              style={[
                styles.detailText, 
                isUrgent && styles.urgentText,
                isPast && styles.pastText
              ]} 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {isPast ? 'Deadline passed' : isUrgent ? `${daysRemaining} days left` : `${daysRemaining} days left`}
            </Text>
          </View>
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
    height: 200,
  },
  headerGradient: {
    padding: 12,
    position: 'relative',
    height: 90,
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  matchText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  renewable: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  contentContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
    minHeight: 40,
  },
  detailsContainer: {
    gap: 6,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  urgentText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  pastText: {
    color: '#999999',
    fontStyle: 'italic',
  },
});