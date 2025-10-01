import { apiService } from './api';
import { useChatStore } from '@/store/chat-store';
import { useUserStore } from '@/store/user-store';
import { Message } from '@/types/chat';

interface WebSocketMessage {
  message?: string;
  system?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

class ChatGPTWebSocket {
  private ws: WebSocket | null = null;
  private userEmail: string | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000; // 2 seconds
  private currentStreamingMessageId: string | null = null;
  private messageCompletionTimeout: any = null; // Using any to avoid type conflicts

  // Connect to the WebSocket server
  async connect(): Promise<boolean> {
    // If already connecting, don't try again
    if (this.isConnecting) return false;
    
    this.isConnecting = true;
    
    try {
      // Get user email from store
      const userStore = useUserStore.getState();
      if (!userStore.userProfile?.email) {
        console.error('Cannot connect to ChatGPT WebSocket: No user email available');
        this.isConnecting = false;
        return false;
      }
      
      this.userEmail = userStore.userProfile.email;
      
      // Get WebSocket URL from API service
      const wsUrl = apiService.getChatGPTWebSocketUrl(this.userEmail);
      
      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl);
      
      // Set up event handlers
      this.setupEventHandlers();
      
      return new Promise((resolve) => {
        // Wait for connection to open or fail
        this.ws!.onopen = () => {
          console.log('ChatGPT WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve(true);
        };
        
        this.ws!.onerror = (error) => {
          console.error('ChatGPT WebSocket connection error:', error);
          this.isConnecting = false;
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error connecting to ChatGPT WebSocket:', error);
      this.isConnecting = false;
      return false;
    }
  }
  
  // Set up WebSocket event handlers
  private setupEventHandlers() {
    if (!this.ws) return;
    
    this.ws.onmessage = (event) => {
      try {
        // Handle incoming message
        const data = event.data;
        
        // Check if it's an error message
        if (typeof data === 'string' && data.startsWith('Error:')) {
          console.error('ChatGPT WebSocket error:', data);
          return;
        }
        
        // Check if it's a "no history" message
        if (typeof data === 'string' && data.includes('no chat history')) {
          console.log('No chat history found for user');
          return;
        }
        
        // Handle streaming response
        this.handleStreamingResponse(data);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('ChatGPT WebSocket closed:', event.code, event.reason);
      
      // Attempt to reconnect if not closed intentionally
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      }
    };
  }
  
  // Send a message to the ChatGPT WebSocket
  async sendMessage(userMessage: string, systemMessage?: string): Promise<string | null> {
    // Make sure we're connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const connected = await this.connect();
      if (!connected) return null;
    }
    
    // Create a message ID for the streaming response
    const messageId = Date.now().toString();
    this.currentStreamingMessageId = messageId;
    
    // Prepare the message
    const message: WebSocketMessage = {
      message: userMessage,
    };
    
    // Add system message if provided
    if (systemMessage) {
      message.system = systemMessage;
    }
    
    // Send the message
    this.ws!.send(JSON.stringify(message));
    
    return messageId;
  }
  
  // Handle streaming response from the WebSocket
  private handleStreamingResponse(data: string) {
    // Skip empty data or special control messages
    if (!data || data.trim() === '' || 
        data.includes('no chat history') || 
        data.includes('No history found')) {
      return;
    }
    
    // Reset any existing completion timeout
    if (this.messageCompletionTimeout) {
      clearTimeout(this.messageCompletionTimeout);
      this.messageCompletionTimeout = null;
    }
    
    // Set a new completion timeout - if no new data comes in for 2 seconds, consider the message complete
    this.messageCompletionTimeout = setTimeout(() => {
      const chatStore = useChatStore.getState();
      chatStore.setIsTyping(false);
      this.messageCompletionTimeout = null;
    }, 2000);
    
    const chatStore = useChatStore.getState();
    
    // If we don't have a current message ID, create one
    if (!this.currentStreamingMessageId) {
      this.currentStreamingMessageId = Date.now().toString();
    }
    
    try {
      // Check if data is JSON (could be an error object)
      const jsonData = JSON.parse(data);
      if (jsonData.error) {
        console.error('Error from WebSocket:', jsonData.error);
        // End typing state if there's an error
        chatStore.setIsTyping(false);
        return;
      }
      
      // If it's a valid JSON but not an error, use the message property if it exists
      if (jsonData.message) {
        data = jsonData.message;
      }
      
      // Check for completion message
      if (jsonData.status === 'complete' || jsonData.complete === true) {
        // Response is complete, end typing state
        chatStore.setIsTyping(false);
        return;
      }
    } catch (e) {
      // Not JSON, continue with the string data
    }
    
    // Check if we already have a message with this ID
    const existingMessageIndex = chatStore.messages.findIndex(
      (msg) => msg.id === this.currentStreamingMessageId
    );
    
    if (existingMessageIndex === -1) {
      // Create a new message
      const botMessage: Message = {
        id: this.currentStreamingMessageId,
        text: data,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      chatStore.addMessage(botMessage);
    } else {
      // Update existing message
      const updatedMessages = [...chatStore.messages];
      updatedMessages[existingMessageIndex] = {
        ...updatedMessages[existingMessageIndex],
        text: updatedMessages[existingMessageIndex].text + data,
      };
      
      chatStore.setMessages(updatedMessages);
    }
    
    // Check if this appears to be the end of a response
    if (data.endsWith('.') || data.endsWith('!') || data.endsWith('?') || 
        data.endsWith('\n\n') || data.length > 100) {
      // This is likely the end of a response, so stop the typing indicator
      // Add a small delay to make the transition look more natural
      setTimeout(() => {
        chatStore.setIsTyping(false);
      }, 500);
    }
  }
  
  // Disconnect from the WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear any pending timeouts
    if (this.messageCompletionTimeout) {
      clearTimeout(this.messageCompletionTimeout);
      this.messageCompletionTimeout = null;
    }
    
    this.currentStreamingMessageId = null;
    
    // Make sure to clear typing state when disconnecting
    const chatStore = useChatStore.getState();
    chatStore.setIsTyping(false);
    chatStore.setIsStreaming(false);
  }
}

// Create and export a singleton instance
export const chatGPTWebSocket = new ChatGPTWebSocket();

export default ChatGPTWebSocket;
