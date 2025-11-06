import React, { memo } from 'react';
import { StyleSheet, View, StyleProp, ImageStyle, ViewStyle } from 'react-native';
import { Image, ImageErrorEventData } from 'expo-image';
import { useTheme } from '@/contexts/theme-context';

interface OptimizedImageProps {
  source: string | { uri: string };
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: string | { uri: string };
  transition?: number;
  blurRadius?: number;
  alt?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onLoad?: () => void;
  onError?: (error: ImageErrorEventData) => void;
  cachePolicy?: 'memory-disk' | 'memory' | 'disk' | 'none';
}

/**
 * A performance-optimized image component that uses expo-image
 * Features:
 * - Automatic caching
 * - Blurhash placeholder support
 * - Progressive loading
 * - Memory efficient
 */
const OptimizedImage = ({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  transition = 300,
  blurRadius,
  alt,
  containerStyle,
  onLoad,
  onError,
  cachePolicy = 'memory-disk'
}: OptimizedImageProps) => {
  const { isDarkMode } = useTheme();
  
  // Process source to ensure it's in the correct format
  const processedSource = typeof source === 'string' ? { uri: source } : source;
  
  // Process placeholder if provided
  const processedPlaceholder = placeholder 
    ? typeof placeholder === 'string' 
      ? { uri: placeholder } 
      : placeholder
    : undefined;
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={processedSource}
        style={[styles.image, style]}
        contentFit={contentFit}
        placeholder={processedPlaceholder}
        transition={transition}
        blurRadius={blurRadius}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        cachePolicy={cachePolicy}
        recyclingKey={`${processedSource.uri}-${isDarkMode ? 'dark' : 'light'}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(OptimizedImage);
