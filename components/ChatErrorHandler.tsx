import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircleIcon as AlertCircle, RefreshCwIcon as RefreshCw } from '@/components/icons';

interface ChatErrorHandlerProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Component to display chat errors and provide retry functionality
 */
export default function ChatErrorHandler({ error, onRetry }: ChatErrorHandlerProps) {
  const [visible, setVisible] = useState<boolean>(!!error);

  useEffect(() => {
    setVisible(!!error);
  }, [error]);

  if (!visible || !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.errorContent}>
        <AlertCircle size={24} color="#fff" />
        <Text style={styles.errorText}>
          {error.message || "Unable to connect to chat service"}
        </Text>
      </View>
      <TouchableOpacity style={styles.retryButton} onPress={() => {
        setVisible(false);
        onRetry();
      }}>
        <RefreshCw size={16} color="#fff" />
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});
