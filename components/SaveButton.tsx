import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSavedItemsStore } from '@/store/saved-items-store';
import { useToast } from '@/context/ToastContext';

interface SaveButtonProps {
  itemId: string;
  itemType: 'scholarship' | 'event' | 'organization';
  itemName: string;
  style?: any;
}

const SaveButton = ({ itemId, itemType, itemName, style }: SaveButtonProps) => {
  const { isSaved, addSavedItem, removeSavedItem } = useSavedItemsStore();
  const { showToast } = useToast();
  
  const saved = isSaved(itemId);
  
  const handlePress = () => {
    if (saved) {
      removeSavedItem(itemId);
      showToast({
        message: `Removed from saved items`,
        type: 'info',
        position: 'bottom',
      });
    } else {
      addSavedItem(itemId, itemType);
      showToast({
        message: `${itemName} saved to favorites`,
        type: 'success',
        position: 'bottom',
      });
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.button, saved ? styles.savedButton : styles.unsavedButton]}>
        <Heart 
          size={16} 
          color={saved ? Colors.white : Colors.primary}
          fill={saved ? Colors.white : 'transparent'}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  unsavedButton: {
    backgroundColor: Colors.white,
  },
  savedButton: {
    backgroundColor: Colors.primary,
  }
});

export default SaveButton;
