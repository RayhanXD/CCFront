export interface UserPreferences {
  notifications?: boolean;
  privacyMode?: boolean;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface UserProfile {
  name: string;
  email?: string;
  major: string;
  year: string;
  interests: string[];
  onboardingComplete?: boolean;
  preferences?: UserPreferences;
}