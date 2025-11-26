import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle, 
  Animated, 
  Easing 
} from 'react-native';
import apiService from '@/lib/api';
import { config } from '@/lib/config';
import { RefreshCwIcon as RefreshCw, WifiIcon as Wifi, WifiOffIcon as WifiOff } from '@/components/icons';
import Colors from '@/constants/colors';

const AnimatedRefresh = Animated.createAnimatedComponent(RefreshCw);

interface ApiStatusIndicatorProps {
  onRetry?: () => void;
  isUsingFallbackData?: boolean;
  error?: string | null;
  isLoading?: boolean;
}

/**
 * Component to display the API connection status
 * Shows whether the app is using real data or mock data
 */
export default function ApiStatusIndicator({ 
  onRetry, 
  isUsingFallbackData = false, 
  error = null, 
  isLoading = false 
}: ApiStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const spinValue = new Animated.Value(0);

  // Start/stop spinning animation
  useEffect(() => {
    if (isLoading || isChecking) {
      startSpinning();
    } else {
      stopSpinning();
    }
    return stopSpinning;
  }, [isLoading, isChecking]);

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinning = () => {
    spinValue.stopAnimation();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Check API connection on mount and when retry is pressed
  const checkApiConnection = useCallback(async () => {
    if (isChecking || isLoading) return;
    
    setIsChecking(true);
    
    try {
      // If we have an explicit error from props, use that
      if (error) {
        setIsConnected(false);
        return;
      }
      
      // Set a 50-second timeout for the health check
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timed out after 50 seconds')), 50000)
      );
      
      // Race between the health check and the timeout
      const response = await Promise.race([
        apiService.getHealth(),
        timeoutPromise
      ]) as { status: string };
      
      setIsConnected(response.status === 'ok');
    } catch (error) {
      // Silently handle the error without logging
      setIsConnected(false);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, [error, isChecking, isLoading]);

  // Check connection on mount and when error or loading state changes
  useEffect(() => {
    // Only run the effect when error or isLoading changes
    if (error || isLoading) {
      if (error) {
        setIsConnected(false);
      } else if (isLoading) {
        setIsConnected(null);
      }
      return;
    }
    
    // Initial check
    checkApiConnection();
    
    // Set up interval for periodic checks
    const interval = setInterval(checkApiConnection, 30000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [error, isLoading, checkApiConnection]);

  // Handle retry button press
  const handleRetry = () => {
    checkApiConnection();
    if (onRetry) onRetry();
  };

  // Determine status message and icon
  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: (
          <AnimatedRefresh 
            size={16} 
            color="#f59e0b" 
            style={[styles.icon, { transform: [{ rotate: spin }] }]} 
          />
        ),
        text: 'Loading...',
        color: '#f59e0b'
      };
    }
    
    if (error || isConnected === false) {
      return {
        icon: <WifiOff size={16} color="#ef4444" />,
        text: isUsingFallbackData ? 'Using cached data' : 'Offline mode',
        color: '#ef4444'
      };
    }
    
    if (config.USE_MOCK_DATA) {
      return {
        icon: <Wifi size={16} color="#f59e0b" />,
        text: 'Using mock data',
        color: '#f59e0b'
      };
    }
    
    return {
      icon: <Wifi size={16} color="#10b981" />,
      text: 'Connected',
      color: '#10b981'
    };
  };
  
  const status = getStatusInfo();

  return (
    <View style={[styles.container, { borderColor: status.color }]}>
      <View style={styles.statusContainer}>
        {status.icon}
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.text}
        </Text>
      </View>
      
      {onRetry && (isConnected === false || error) && !isLoading && (
        <TouchableOpacity 
          style={[styles.retryButton, { borderColor: status.color }]} 
          onPress={handleRetry}
          disabled={isChecking}
        >
          <AnimatedRefresh 
            size={14} 
            color={status.color}
            style={[
              styles.icon,
              isChecking && { transform: [{ rotate: spin }] }
            ]} 
          />
          <Text style={[styles.retryText, { color: status.color }]}>
            {isChecking ? 'Connecting...' : 'Retry'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    borderWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  icon: {
    width: 16,
    height: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 10,
    fontWeight: '600',
  }
});
