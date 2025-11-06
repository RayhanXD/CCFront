import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { 
  Home, BookOpen, Calendar, Search, User, ChevronLeft, ChevronRight,
  Settings, Heart, Award, Edit, MessageSquare, Send, Bot, Info, History,
  Trash2, Copy, ArrowLeft, Mail, FileText, Shield, Bell, Lock, RefreshCw,
  AlertTriangle, Bookmark, Plus, X, Shuffle, ExternalLink, Tag, Clock, Share2
} from 'lucide-react-native';

// Map of available icons
const icons = {
  Home, BookOpen, Calendar, Search, User, ChevronLeft, ChevronRight,
  Settings, Heart, Award, Edit, MessageSquare, Send, Bot, Info, History,
  Trash2, Copy, ArrowLeft, Mail, FileText, Shield, Bell, Lock, RefreshCw,
  AlertTriangle, Bookmark, Plus, X, Shuffle, ExternalLink, Tag, Clock, Share2
};

type IconName = keyof typeof icons;

interface ThemedIconProps {
  name: IconName;
  size?: number;
  color?: string;
  active?: boolean;
  strokeWidth?: number;
  style?: any; // Add style prop
}

/**
 * A themed icon component that uses Lucide icons with theme support
 * This ensures consistent icon styling across the app
 */
export default function ThemedIcon({ 
  name, 
  size = 24, 
  color, 
  active = false,
  strokeWidth = 2,
  style
}: ThemedIconProps) {
  const { theme } = useTheme();
  
  // Determine the color based on props and theme
  const iconColor = color || (active ? theme.iconActive : theme.icon);
  
  // Get the icon component from our map
  const IconComponent = icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in available icons`);
    return null;
  }
  
  return <IconComponent size={size} color={iconColor} strokeWidth={strokeWidth} style={style} />;
}
