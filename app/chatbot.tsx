import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '@/components/CustomStatusBar';
import { Send, Bot, User, Info, History, Settings, Trash2, Copy, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/theme-context';
import { useChatStore } from '@/store/chat-store';
import { useUserStore } from '@/store/user-store';
import { Message } from '@/types/chat';
import Logo from '@/components/Logo';
import { chatGPTWebSocket } from '@/lib/chatgpt-websocket';
import apiService, { ChatGPTMessage } from '@/lib/api';
import ChatbotWrapper from '@/components/ChatbotWrapper';

export default function ChatbotScreen() {
  const router = useRouter();
  const { messages, addMessage, isTyping, setIsTyping, isStreaming, setIsStreaming, systemMessage, clearMessages } = useChatStore();
  const { userProfile } = useUserStore();
  const { theme, isDarkMode } = useTheme();
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
  
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        typingTimeoutRef.current = null;
      }, 15000);
    }
    
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
    
    // Add user message with a distinct ID prefixed with 'user-'
    const userMessage: Message = {
      id: `user-${Date.now().toString()}`,
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
          id: `bot-${Date.now().toString()}`,
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
          id: `bot-${Date.now().toString()}`,
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
  
  // Function to handle clearing the chat
  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearMessages();
          }
        }
      ]
    );
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
  
  // Function to handle message actions (copy or delete)
  const handleMessageAction = (message: Message) => {
    // Extract conversation ID from the message ID if available
    const conversationId = message.id.includes('-') ? message.id.split('-')[1] : null;
    
    Alert.alert(
      'Message Options',
      'What would you like to do with this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Copy Text', 
          onPress: () => {
            // Copy message text to clipboard
            Clipboard.setString(message.text);
            Alert.alert('Copied', 'Message text copied to clipboard');
          }
        },
        ...(conversationId && userProfile?.email ? [
          { 
            text: 'Delete', 
            style: 'destructive' as 'destructive', 
            onPress: () => handleDeleteConversation(conversationId)
          }
        ] : [])
      ]
    );
  };
  
  // Function to load chat history
  const handleLoadHistory = async () => {
    if (!userProfile?.email) {
      Alert.alert('Error', 'You must be logged in to view chat history');
      return;
    }
    
    setIsLoadingHistory(true);
    
    try {
      // Fetch chat history from API
      const history = await apiService.getChatGPTHistory(userProfile.email);
      
      if (history && history.conversations && history.conversations.length > 0) {
        // Convert to Message format
        const historyMessages: Message[] = [];
        
        history.conversations.forEach(conv => {
          // Add user message
          historyMessages.push({
            id: `user-${conv.conversation_id}`,
            text: conv.user_message,
            sender: 'user',
            timestamp: conv.timestamp,
          });
          
          // Add assistant response
          historyMessages.push({
            id: `bot-${conv.conversation_id}`,
            text: conv.assistant_response,
            sender: 'bot',
            timestamp: conv.timestamp,
          });
        });
        
        // Update messages in store
        useChatStore.getState().setMessages(historyMessages);
      } else {
        Alert.alert('No History', 'No chat history found. Start a new conversation!');
      }
    } catch (error) {
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
  
  // Handle deleting a specific conversation
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      if (userProfile?.email) {
        // Show loading indicator
        setIsSendingMessage(true);
        
        // Delete from server
        await apiService.deleteChatGPTConversation(userProfile.email, conversationId);
        console.log('Successfully deleted conversation from server');
        
        // Remove from local state
        const updatedMessages = messages.filter(msg => {
          // Remove both the user message and bot response for this conversation
          return !msg.id.includes(conversationId);
        });
        
        useChatStore.getState().setMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert('Error', 'Failed to delete conversation. Please try again.');
    } finally {
      // Hide loading indicator
      setIsSendingMessage(false);
    }
  };
  
  // Function to render formatted text with bold sections
  const renderFormattedText = (text: string, textStyle: any) => {
    const parts = text.split(/\*\*/);
    
    if (parts.length === 1) {
      return <Text style={textStyle}>{text}</Text>;
    }
    
    return (
      <Text style={textStyle}>
        {parts.map((part, index) => {
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
  
  // Render message item component
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === 'user';
    
    return (
      <View style={{
        width: '100%',
        alignItems: isUserMessage ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}>
        {/* Sender indicator */}
        <Text style={{
          fontSize: 12,
          color: theme.textSecondary,
          marginBottom: 2,
          marginLeft: 12,
        }}>
          {isUserMessage ? 'You' : 'AI Assistant'}
        </Text>
        
        {/* Message bubble */}
        <TouchableOpacity
          style={[
            styles.messageBubble,
            isUserMessage
              ? [styles.userBubble, { backgroundColor: theme.primary }]
              : [styles.botBubble, { backgroundColor: theme.cardBackground }]
          ]}
          onLongPress={() => handleMessageAction(item)}
          activeOpacity={0.8}
        >
          {isUserMessage ? (
            <User size={16} color="#FFFFFF" style={styles.messageIcon} />
          ) : (
            <Bot size={16} color={theme.primary} style={styles.messageIcon} />
          )}
          {renderFormattedText(
            item.text,
            [styles.messageText, {
              color: isUserMessage ? '#FFFFFF' : theme.text,
              textAlign: 'left',
            }]
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ChatbotWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomStatusBar style={isDarkMode ? 'light' : 'dark'} />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? theme.cardBackground : theme.white, borderBottomColor: isDarkMode ? theme.border : theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={isDarkMode ? theme.textInverted : theme.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Bot size={20} color={theme.primary} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Campus AI</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleLoadHistory} style={styles.headerButton}>
              <History size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearChat} style={styles.headerButton}>
              <Trash2 size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
        contentContainerStyle={[
          styles.messagesContainer,
          { paddingBottom: 16 }
        ]}
        style={{ flex: 1 }}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />
      
      {/* Typing Indicator */}
      {isTyping && (
        <View style={[styles.typingContainer, { backgroundColor: isDarkMode ? theme.cardBackground : theme.white }]}>
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>AI is typing...</Text>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      )}
      
      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[
          styles.inputContainer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border
          }
        ]}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border
            }]}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            placeholderTextColor={theme.textSecondary}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { backgroundColor: theme.primary },
              (inputText.trim() === '' || isSendingMessage) && 
                [styles.disabledSendButton, { backgroundColor: theme.primaryLight }]
            ]}
            onPress={handleSendMessage}
            disabled={inputText.trim() === '' || isSendingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color={theme.textInverted} />
            ) : (
              <Send size={20} color={theme.textInverted} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ChatbotWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  historyButton: {
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    justifyContent: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 16,
  },
});
