import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { apiService } from '@/lib/api';
import { config } from '@/lib/config';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react-native';

interface ApiStatusIndicatorProps {
  onRetry?: () => void;
}

/**
 * Component to display the API connection status
 * Shows whether the app is using real data or mock data
 */
export default function ApiStatusIndicator({ onRetry }: ApiStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check API connection on mount and when retry is pressed
  const checkApiConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      // Try to connect to the API
      const response = await apiService.healthCheck();
      setIsConnected(response.status === 'ok');
    } catch (error) {
      console.error('API connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkApiConnection();
    
    // Set up interval to check connection every 30 seconds
    const interval = setInterval(checkApiConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle retry button press
  const handleRetry = () => {
    checkApiConnection();
    if (onRetry) onRetry();
  };

  // If using mock data, show that instead
  if (config.USE_MOCK_DATA) {
    return (
      <View style={[styles.container, styles.mockContainer]}>
        <Text style={styles.mockText}>Using Mock Data</Text>
      </View>
    );
  }

  // If still checking, show loading
  if (isConnected === null) {
    return (
      <View style={[styles.container, styles.checkingContainer]}>
        <Text style={styles.checkingText}>Checking API...</Text>
      </View>
    );
  }

  // Show connected or disconnected status
  return (
    <View style={[
      styles.container, 
      isConnected ? styles.connectedContainer : styles.disconnectedContainer
    ]}>
      {isConnected ? (
        <>
          <Wifi size={16} color="#fff" />
          <Text style={styles.connectedText}>Using Real Data</Text>
        </>
      ) : (
        <>
          <WifiOff size={16} color="#fff" />
          <Text style={styles.disconnectedText}>API Disconnected</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            disabled={isChecking}
          >
            <RefreshCw size={14} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </>
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
    gap: 6,
  },
  connectedContainer: {
    backgroundColor: '#4CAF50',
  },
  disconnectedContainer: {
    backgroundColor: '#F44336',
  },
  mockContainer: {
    backgroundColor: '#FF9800',
  },
  checkingContainer: {
    backgroundColor: '#2196F3',
  },
  connectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  disconnectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  checkingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
