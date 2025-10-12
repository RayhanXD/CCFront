import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: React.ReactNode;
  buttonText?: string;
  buttonAction?: () => void;
  onClose: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
}

const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  icon,
  buttonText = 'OK',
  buttonAction,
  onClose,
  type = 'info',
  secondaryButtonText,
  secondaryButtonAction
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);
  
  // Define colors based on type
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const typeColor = getTypeColor();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[styles.overlay, { opacity: fadeAnim }]}
        >
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.dialogContainer,
                { 
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }] 
                }
              ]}
              accessibilityRole="alert"
              accessibilityLabel={`${type} dialog: ${title}`}
              accessibilityHint="Dialog with important information"
            >
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                accessibilityHint="Closes the current dialog"
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              {icon && (
                <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
                  {icon}
                </View>
              )}
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              
              <View style={styles.buttonContainer}>
                {secondaryButtonText && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: typeColor }]}
                    onPress={() => {
                      if (secondaryButtonAction) {
                        secondaryButtonAction();
                      } else {
                        onClose();
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={secondaryButtonText}
                    accessibilityHint={`Secondary action for ${type} dialog`}
                  >
                    <Text style={[styles.secondaryButtonText, { color: typeColor }]}>{secondaryButtonText}</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: typeColor }]}
                  onPress={() => {
                    if (buttonAction) {
                      buttonAction();
                    } else {
                      onClose();
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={buttonText}
                  accessibilityHint={`Primary action for ${type} dialog`}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: width * 0.85,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 100,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Dialog;
