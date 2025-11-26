import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRightIcon as ChevronRight } from '@/components/icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import Colors from '@/constants/colors';

export interface BreadcrumbItem {
  readonly label: string;
  readonly path: Href;
}

interface BreadcrumbNavigationProps {
  readonly items: readonly BreadcrumbItem[];
}

const BreadcrumbNavigation = ({ items }: BreadcrumbNavigationProps) => {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <React.Fragment key={`breadcrumb-${index}`}>
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
              // Handle both string and object-style routes
              if (typeof item.path === 'string') {
                router.push(item.path as any);
              } else {
                router.push(item.path);
              }
            }}
            disabled={index === items.length - 1}
          >
            <Text 
              style={[
                styles.itemText,
                index === items.length - 1 && styles.activeItemText
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
          
          {index < items.length - 1 && (
            <ChevronRight size={16} color={Colors.textSecondary} style={styles.separator} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    flexWrap: 'wrap',
  },
  itemContainer: {
    maxWidth: 150,
  },
  itemText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeItemText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 4,
  },
});

export default BreadcrumbNavigation;