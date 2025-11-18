import { useEffect } from 'react';
import { useUserStore } from '@/store/user-store';

export function useLoadingScreen() {
  const { 
    showLoadingScreen, 
    loadingSteps, 
    currentLoadingStep,
    setLoadingSteps,
    setCurrentLoadingStep,
    setShowLoadingScreen 
  } = useUserStore();

  const startLoading = (steps: string[]) => {
    setLoadingSteps(steps);
    setShowLoadingScreen(true);
  };

  const nextStep = () => {
    setCurrentLoadingStep(currentLoadingStep + 1);
  };

  const completeLoading = () => {
    setShowLoadingScreen(false);
    setCurrentLoadingStep(0);
    setLoadingSteps([]);
  };

  return {
    showLoadingScreen,
    loadingSteps,
    currentLoadingStep,
    startLoading,
    nextStep,
    completeLoading,
  };
}
