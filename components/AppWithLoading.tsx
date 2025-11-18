import React from 'react';
import { View } from 'react-native';
import LoadingScreen from './LoadingScreen';
import { useUserStore } from '@/store/user-store';

interface AppWithLoadingProps {
  children: React.ReactNode;
}

export default function AppWithLoading({ children }: AppWithLoadingProps) {
  const { 
    showLoadingScreen, 
    loadingSteps, 
    currentLoadingStep,
    setShowLoadingScreen 
  } = useUserStore();

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      <LoadingScreen
        visible={showLoadingScreen}
        onComplete={handleLoadingComplete}
        steps={loadingSteps}
      />
    </View>
  );
}
