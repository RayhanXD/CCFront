import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useChatStore } from '@/store/chat-store';
import ChatErrorHandler from './ChatErrorHandler';
import { apiService } from '@/lib/api';

interface ChatbotWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for the chatbot to handle errors and provide retry functionality
 */
export default function ChatbotWrapper({ children }: ChatbotWrapperProps) {
  const { error, clearError } = useChatStore();

  // Function to retry connecting to the chatbot
  const handleRetry = async () => {
    clearError();
    
    try {
      // Test the connection to the chatbot API
      await apiService.healthCheck();
      
      // If successful, we can try to reconnect the WebSocket
      // This assumes you have a WebSocket instance that can be accessed
      // You might need to modify this based on your actual implementation
      try {
        // Try to import the WebSocket class and create a new instance
        const { ChatGPTWebSocket } = require('@/lib/chatgpt-websocket');
        if (ChatGPTWebSocket) {
          const webSocketInstance = new ChatGPTWebSocket();
          await webSocketInstance.connect();
        }
      } catch (wsError) {
        console.error('Error initializing WebSocket:', wsError);
      }
    } catch (error) {
      console.error('Error retrying chatbot connection:', error);
      // If there's an error, we'll set it in the store
      useChatStore.getState().setError(
        error instanceof Error ? error : new Error('Failed to reconnect to chatbot')
      );
    }
  };

  return (
    <View style={styles.container}>
      <ChatErrorHandler error={error} onRetry={handleRetry} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
