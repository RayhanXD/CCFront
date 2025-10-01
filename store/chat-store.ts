import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/types/chat';

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isStreaming: boolean;
  systemMessage: string;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setIsTyping: (isTyping: boolean) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setSystemMessage: (systemMessage: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isTyping: false,
      isStreaming: false,
      systemMessage: 'You are CampusAI, a helpful assistant for college students. You provide information about campus resources, events, scholarships, and academic information.',
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),
      setIsTyping: (isTyping) => set({ isTyping }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setSystemMessage: (systemMessage) => set({ systemMessage }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        messages: state.messages,
        systemMessage: state.systemMessage,
      }),
    }
  )
);