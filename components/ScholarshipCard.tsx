import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AwardIcon as Award, CalendarIconComponent as Calendar } from '@/components/icons';
import Colors from '@/constants/colors';
import { Scholarship } from '@/types/scholarship';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '@/components/AnimatedCard';
import InsightButton from '@/components/InsightButton';
import { useUserStore } from '@/store/user-store';
import { useTheme } from '@/contexts/theme-context';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onPress: (id: string) => void;
}

export const ScholarshipCard = ({ scholarship, onPress }: ScholarshipCardProps) => {
  const { userProfile } = useUserStore();
  const { theme, isDarkMode } = useTheme();
  
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
    
    // Debug logging for scholarships showing 0 days
    if (diffDays <= 0) {
      console.log('📚 Deadline debug:', {
        scholarshipName: scholarship.name,
        dateString,
        deadline: deadline.toISOString(),
        today: today.toISOString(),
        diffDays,
        isValidDate: !isNaN(deadline.getTime())
      });
    }
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(scholarship.deadline);
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
  const isPast = daysRemaining < 0;

  return (
    <AnimatedCard
      style={[
        styles.container, 
        { 
          backgroundColor: theme.cardBackground,
          shadowColor: isDarkMode ? '#000' : '#000',
          shadowOpacity: isDarkMode ? 0.3 : 0.05,
          elevation: isDarkMode ? 4 : 2,
        }
      ]}
      onPress={() => onPress(scholarship.id)}
    >
      <LinearGradient
        colors={isDarkMode ? 
          [theme.primaryDark, theme.background] : 
          [theme.primaryLight, theme.background]
        }
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
        
        <View style={[styles.matchBadge, { backgroundColor: theme.matchBadge }]}>
          <Text style={styles.matchText}>{scholarship.matchPercentage}%</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: theme.text }]}>
            {scholarship.amount > 0 ? formatCurrency(scholarship.amount) : 'N/A'}
          </Text>
          {scholarship.renewable && (
            <Text style={[styles.renewable, { color: theme.primary }]}>
              Renewable
            </Text>
          )}
        </View>
      </LinearGradient>
      
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.title, { color: theme.text }]} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {scholarship.name}
        </Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detail}>
            <Award size={14} color={theme.primary} />
            <Text 
              style={[styles.detailText, { color: theme.textSecondary }]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {scholarship.category}
            </Text>
          </View>
          
          <View style={styles.detail}>
            <Calendar 
              size={14} 
              color={isUrgent ? theme.primary : theme.textSecondary} 
              strokeWidth={isDarkMode ? 2.5 : 2}
            />
            <Text 
              style={[
                styles.detailText, 
                { color: theme.textSecondary },
                isUrgent && [styles.urgentText, { color: theme.primary }],
                isPast && [styles.pastText, { color: theme.textMuted }]
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
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  matchText: {
    color: '#FFFFFF',
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
  },
  renewable: {
    fontSize: 10,
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
    flex: 1,
  },
  urgentText: {
    fontWeight: '500',
  },
  pastText: {
    fontStyle: 'italic',
  },
});