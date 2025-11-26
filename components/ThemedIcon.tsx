import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { 
  HomeIcon, BookOpenIcon, CalendarIconComponent, SearchIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon,
  SettingsIcon, HeartIcon, AwardIcon, EditIcon, MessageSquareIcon, SendIcon, BotIcon, InfoIcon, HistoryIcon,
  Trash2Icon, CopyIcon, ArrowLeftIcon, MailIcon, FileTextIcon, ShieldIcon, BellIcon, LockIcon, RefreshCwIcon,
  AlertTriangleIcon, BookmarkIcon, PlusIcon, XIcon, ShuffleIcon, ExternalLinkIcon, TagIcon, ClockIcon, Share2Icon
} from '@/components/icons';

// Map of available icons
const icons = {
  Home: HomeIcon,
  BookOpen: BookOpenIcon,
  Calendar: CalendarIconComponent,
  Search: SearchIcon,
  User: UserIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  Settings: SettingsIcon,
  Heart: HeartIcon,
  Award: AwardIcon,
  Edit: EditIcon,
  MessageSquare: MessageSquareIcon,
  Send: SendIcon,
  Bot: BotIcon,
  Info: InfoIcon,
  History: HistoryIcon,
  Trash2: Trash2Icon,
  Copy: CopyIcon,
  ArrowLeft: ArrowLeftIcon,
  Mail: MailIcon,
  FileText: FileTextIcon,
  Shield: ShieldIcon,
  Bell: BellIcon,
  Lock: LockIcon,
  RefreshCw: RefreshCwIcon,
  AlertTriangle: AlertTriangleIcon,
  Bookmark: BookmarkIcon,
  Plus: PlusIcon,
  X: XIcon,
  Shuffle: ShuffleIcon,
  ExternalLink: ExternalLinkIcon,
  Tag: TagIcon,
  Clock: ClockIcon,
  Share2: Share2Icon
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
