import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import { Send, Bot, User, Info, History, Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { useUserStore } from '@/store/user-store';
import { Message } from '@/types/chat';
import Logo from '@/components/Logo';
import { chatGPTWebSocket } from '@/lib/chatgpt-websocket';
import { apiService, ChatGPTMessage } from '@/lib/api';

export default function ChatbotScreen() {
  const { messages, addMessage, isTyping, setIsTyping, isStreaming, setIsStreaming, systemMessage } = useChatStore();
  const { userProfile } = useUserStore();
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const typingTimeoutRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    // Connect to WebSocket when user is logged in
    if (userProfile?.email) {
      chatGPTWebSocket.connect();
    }
    
    // Disconnect when component unmounts
    return () => {
      chatGPTWebSocket.disconnect();
    };
  }, [userProfile?.email]);
  
  // Animate loading indicator
  useEffect(() => {
    if (isSendingMessage) {
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [isSendingMessage]);
  
  // Safety timeout to clear typing indicator if it gets stuck
  useEffect(() => {
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // If typing is active, set a timeout to clear it after a reasonable time
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        typingTimeoutRef.current = null;
      }, 15000); // 15 seconds max typing time
    }
    
    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, setIsTyping]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;
    if (!userProfile?.email) {
      Alert.alert('Error', 'You must be logged in to use the chatbot');
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    addMessage(userMessage);
    setInputText('');
    
    // Start loading and typing indicators
    setIsSendingMessage(true);
    setIsTyping(false); // Don't show typing indicator yet
    setIsStreaming(true);
    
    try {
      // Send message to WebSocket for streaming response
      const messageId = await chatGPTWebSocket.sendMessage(inputText, `${systemMessage}. Write in 2-3 sentences or 3-4 bullet points. Be concise and clear.`);

      if (messageId) {
        setIsSendingMessage(false);
        setIsTyping(true);
        
        // Safety timeout - if typing indicator gets stuck, clear it after 15 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 15000);
      }
    } catch (error) {
      console.error('Error sending message to WebSocket:', error);
      
      // Fallback to REST API if WebSocket fails
      try {
        const chatMessages: ChatGPTMessage[] = [
          { role: 'system', content: `${systemMessage}. Write in 2-3 sentences or 3-4 bullet points. Be concise and clear.` },
          { role: 'user', content: inputText }
        ];
        
        const response = await apiService.chatGPT({
          user_email: userProfile.email,
          messages: chatMessages
        });
        
        const botMessage: Message = {
          id: Date.now().toString(),
          text: response.message,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        
        addMessage(botMessage);
      } catch (apiError) {
        console.error('Error using ChatGPT API:', apiError);
        
        // Final fallback to local response
        const fallbackResponse = "I'm sorry, I'm having trouble connecting to the server. Please try again later.";
        const botMessage: Message = {
          id: Date.now().toString(),
          text: fallbackResponse,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        
        addMessage(botMessage);
      }
    } finally {
      // Only clear the sending state if we failed to send the message
      // Otherwise, the typing indicator will be cleared when the response is complete
      if (isSendingMessage) {
        setIsSendingMessage(false);
      }
      setIsStreaming(false);
    }
  };
  
  // Load chat history from the server
  const loadChatHistory = async () => {
    if (!userProfile?.email) return;
    
    setIsLoadingHistory(true);
    
    try {
      const history = await apiService.getChatGPTHistory(userProfile.email);
      
      // Check if history exists and has conversations
      if (history && history.conversations && history.conversations.length > 0) {
        // Convert history to messages
        const historyMessages: Message[] = [];
        
        history.conversations.forEach((conversation) => {
          // Add user message
          historyMessages.push({
            id: `user-${conversation.conversation_id}`,
            text: conversation.user_message,
            sender: 'user',
            timestamp: conversation.timestamp,
          });
          
          // Add bot message
          historyMessages.push({
            id: `bot-${conversation.conversation_id}`,
            text: conversation.assistant_response,
            sender: 'bot',
            timestamp: conversation.timestamp,
          });
        });
        
        // Replace current messages with history
        useChatStore.getState().setMessages(historyMessages);
      } else {
        // No conversations found
        console.log('No chat history found for user:', userProfile.email);
        if (messages.length === 0) {
          // Only show alert if we don't have any messages already
          Alert.alert('No History', 'No chat history found. Start a new conversation!');
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          Alert.alert('No History', 'No chat history found. Start a new conversation!');
        } else {
          Alert.alert('Error', 'Failed to load chat history: ' + error.message);
        }
      } else {
        Alert.alert('Error', 'Failed to load chat history');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Effect to load chat history when user profile is available
  useEffect(() => {
    if (userProfile?.email && messages.length === 0) {
      loadChatHistory();
    }
  }, [userProfile?.email, messages.length]);
  
  // Function to parse and render markdown-like formatting
  const renderFormattedText = (text: string, textStyle: any) => {
    // Split the text by bold markers (**)
    const parts = text.split(/\*\*/);
    
    // If there are no ** markers, return plain text
    if (parts.length === 1) {
      return <Text style={textStyle}>{text}</Text>;
    }
    
    // Create an array of text elements with appropriate styling
    return (
      <Text style={textStyle}>
        {parts.map((part, index) => {
          // Even indices are regular text, odd indices are bold text
          const isBold = index % 2 === 1;
          return (
            <Text 
              key={index} 
              style={isBold ? [textStyle, styles.boldText] : textStyle}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  // Render a message item
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.botMessageBubble
        ]}>
          <View style={styles.messageHeader}>
            {!isUser && (
              <View style={styles.botIconContainer}>
                <Bot size={14} color={Colors.white} />
              </View>
            )}
            <Text style={[
              styles.messageSender,
              isUser ? styles.userMessageSender : styles.botMessageSender
            ]}>
              {isUser ? 'You' : 'CampusAI'}
            </Text>
          </View>
          
          {renderFormattedText(
            item.text,
            [styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]
          )}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Logo size={24} />
          <Text style={styles.headerTitle}>CampusAI Assistant</Text>
        </View>
        <View style={styles.headerActions}>
          {userProfile?.email && (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={loadChatHistory}
              disabled={isLoadingHistory}
            >
              <History size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerButton}>
            <Info size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading chat history...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.botAvatarContainer}>
              <Bot size={40} color={Colors.white} />
            </View>
            <Text style={styles.emptyTitle}>CampusAI Assistant</Text>
            <Text style={styles.emptyText}>
              Ask me anything about campus resources, events, scholarships, or academic information.
            </Text>
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => {
                  setInputText("What scholarships are available for my major?");
                }}
              >
                <Text style={styles.suggestionText}>What scholarships are available?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => {
                  setInputText("What events are happening today?");
                }}
              >
                <Text style={styles.suggestionText}>What events are happening today?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => {
                  setInputText("When is the next scholarship deadline?");
                }}
              >
                <Text style={styles.suggestionText}>When is the next scholarship deadline?</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {/* Full-screen loading overlay - only show when initially sending */}
        {isSendingMessage && (
          <Animated.View 
            style={[styles.loadingOverlay, { opacity: loadingOpacity }]}
            pointerEvents="none"
          >
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Sending your message...</Text>
            </View>
          </Animated.View>
        )}
        
        {/* Typing indicator - show when response is streaming */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>CampusAI is typing</Text>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            placeholderTextColor={Colors.textSecondary}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (inputText.trim() === '' || isSendingMessage) && styles.disabledSendButton
            ]}
            onPress={handleSendMessage}
            disabled={inputText.trim() === '' || isSendingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Send size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    paddingBottom: 14,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  botIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  userMessageSender: {
    color: Colors.white,
    opacity: 0.9,
  },
  botMessageSender: {
    color: Colors.primary,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  botMessageText: {
    color: Colors.text,
  },
  typingContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
    alignSelf: 'flex-start',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: Colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: Colors.primaryLight,
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  botAvatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  suggestionsContainer: {
    width: '100%',
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  boldText: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});