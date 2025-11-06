import React, { Suspense, lazy, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

/**
 * Default loading component shown while lazy-loaded component is being loaded
 */
const DefaultLoadingComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
};

/**
 * Creates a lazy-loaded component with a loading fallback
 * @param importFunc Function that imports the component
 * @param LoadingComponent Optional custom loading component
 * @returns Lazy-loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  LoadingComponent: React.ComponentType = DefaultLoadingComponent
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default lazyLoad;
