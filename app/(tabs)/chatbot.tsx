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
  ActivityIndicator
} from 'react-native';
import { Send, Bot, User, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { Message } from '@/types/chat';
import Logo from '@/components/Logo';

export default function ChatbotScreen() {
  const { messages, addMessage, isTyping, setIsTyping } = useChatStore();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    addMessage(userMessage);
    setInputText('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      addMessage(botMessage);
      setIsTyping(false);
    }, 1500);
  };
  
  // Get a bot response based on user input
  const getBotResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm CampusAI, your personal campus assistant. How can I help you today?";
    } else if (input.includes('scholarship') || input.includes('financial aid')) {
      return "I can help you find scholarships! There are several opportunities available based on your major. Would you like me to show you the top matches?";
    } else if (input.includes('event') || input.includes('activities')) {
      return "There are several events happening on campus this week. The AI Workshop today at 2 PM might interest you based on your Computer Science major.";
    } else if (input.includes('class') || input.includes('course')) {
      return "I can help you find information about courses. What specific class are you looking for?";
    } else if (input.includes('deadline') || input.includes('due date')) {
      return "The nearest deadline is for the Presidential Merit Scholarship application, which is due in 15 days. Would you like me to remind you about it?";
    } else if (input.includes('thank')) {
      return "You're welcome! Feel free to ask if you need anything else.";
    } else if (input.includes('bye') || input.includes('goodbye')) {
      return "Goodbye! Have a great day. Feel free to chat anytime you need assistance.";
    } else {
      return "I'm here to help with campus information, events, scholarships, and academic resources. Could you please provide more details about what you're looking for?";
    }
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
          
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText
          ]}>
            {item.text}
          </Text>
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
        <Info size={20} color={Colors.primary} />
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
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
              inputText.trim() === '' && styles.disabledSendButton
            ]}
            onPress={handleSendMessage}
            disabled={inputText.trim() === ''}
          >
            <Send size={20} color={Colors.white} />
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
});