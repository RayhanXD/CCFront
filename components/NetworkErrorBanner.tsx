import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AlertTriangleIcon as AlertTriangle, RefreshCwIcon as RefreshCw } from '@/components/icons';
import { useTheme } from '@/contexts/theme-context';

interface NetworkErrorBannerProps {
  isVisible: boolean;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  isMockData?: boolean;
}

const NetworkErrorBanner: React.FC<NetworkErrorBannerProps> = ({
  isVisible,
  message = 'Network error. Using cached data.',
  onRetry,
  isRetrying = false,
  isMockData = false,
}) => {
  const { theme } = useTheme();
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, animation]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.errorLight,
          borderColor: theme.error,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
          opacity: animation,
        },
      ]}
    >
      <View style={styles.content}>
        <AlertTriangle 
          size={18} 
          color={isMockData ? theme.warning : theme.error} 
          style={styles.icon} 
        />
        <Text style={[styles.message, { color: theme.text }]}>
          {isMockData ? 'Using mock data (no backend)' : message}
        </Text>
      </View>
      
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.error }]}
          onPress={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <RefreshCw size={16} color={theme.white} />
            </Animated.View>
          ) : (
            <RefreshCw size={16} color={theme.white} />
          )}
          <Text style={[styles.retryText, { color: theme.white }]}>
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    position: 'absolute',
    top: 50, // Adjusted to make room for ApiStatusIndicator
    left: 0,
    right: 0,
    zIndex: 999, // Lower than ApiStatusIndicator
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default NetworkErrorBanner;
