import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { HelpCircle, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InsightButtonProps {
  itemType: 'organization' | 'scholarship' | 'event';
  itemName: string;
  matchPercentage: number;
  userProfile: any;
  itemId?: string;
}

const InsightButton = ({ itemType, itemName, matchPercentage, userProfile, itemId }: InsightButtonProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  
  // Animation values - separate from parent animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  const getStorageKey = () => {
    return `insight_clicked_${itemType}_${itemId || itemName.replace(/\s+/g, '_')}`;
  };
  
  useEffect(() => {
    const checkIfClicked = async () => {
      try {
        const value = await AsyncStorage.getItem(getStorageKey());
        if (value === 'true') {
          setHasBeenClicked(true);
        }
      } catch (error) {
        console.log('Error checking clicked status:', error);
      }
    };
    
    checkIfClicked();
  }, []);
  
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;
    
    if (!hasBeenClicked) {
      // Use consistent animation approach for all platforms
      if (Platform.OS === 'web') {
        // For web, use JS-driven animations
        animationLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            })
          ])
        );
      } else {
        // For native, use native driver
        animationLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        );
      }
      
      animationLoop.start();
    } else {
      // Reset to normal state when clicked
      pulseAnim.setValue(1);
    }
    
    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [hasBeenClicked, pulseAnim]);
  
  const handlePress = async () => {
    setModalVisible(true);
    
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      try {
        await AsyncStorage.setItem(getStorageKey(), 'true');
      } catch (error) {
        console.log('Error saving clicked status:', error);
      }
    }
  };
  
  const generateInsight = () => {
    const userMajor = userProfile?.major || 'your major';
    const userInterests = userProfile?.interests || [];
    
    let personalizedExplanation = '';
    let socialProof = '';
    
    switch (itemType) {
      case 'organization':
        personalizedExplanation = `This organization is a ${matchPercentage}% match for you because it aligns with ${userInterests.length > 0 ? `your interest in ${userInterests[0]}` : 'your academic interests'} and is popular among ${userMajor} students.`;
        socialProof = `Students who joined similar organizations reported a 32% increase in professional networking opportunities and were more likely to find internships in their field.`;
        break;
        
      case 'scholarship':
        personalizedExplanation = `This scholarship is a ${matchPercentage}% match for you because it's specifically designed for ${userMajor} students${userInterests.length > 0 ? ` with interests in ${userInterests[0]}` : ''}.`;
        socialProof = `Students with similar profiles who applied for this scholarship had a 40% higher acceptance rate compared to general applications.`;
        break;
        
      case 'event':
        personalizedExplanation = `This event is a ${matchPercentage}% match for you because it covers topics relevant to ${userMajor}${userInterests.length > 0 ? ` and your interest in ${userInterests[0]}` : ''}.`;
        socialProof = `Students who attended similar events reported that the knowledge gained was directly applicable to their coursework and career preparation.`;
        break;
        
      default:
        personalizedExplanation = `This item is a ${matchPercentage}% match based on your profile and preferences.`;
        socialProof = `Students with similar interests have found this valuable for their academic and career development.`;
    }
    
    return { personalizedExplanation, socialProof };
  };
  
  const { personalizedExplanation, socialProof } = generateInsight();
  
  return (
    <>
      <View style={[styles.container, hasBeenClicked && styles.clickedContainer]}>
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <HelpCircle size={20} color={Colors.primary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Why am I seeing this?</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.itemName}>{itemName}</Text>
              
              <View style={styles.insightSection}>
                <Text style={styles.sectionTitle}>Personalized Match</Text>
                <Text style={styles.insightText}>{personalizedExplanation}</Text>
              </View>
              
              <View style={styles.insightSection}>
                <Text style={styles.sectionTitle}>Student Outcomes</Text>
                <Text style={styles.insightText}>{socialProof}</Text>
              </View>
              
              <View style={styles.matchBadgeContainer}>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{matchPercentage}% Match</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  clickedContainer: {
    backgroundColor: Colors.white,
  },
  animatedContainer: {
    width: '100%',
    height: '100%',
  },
  button: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  insightSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  matchBadgeContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  matchBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  matchText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InsightButton;