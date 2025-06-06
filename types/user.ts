export interface UserProfile {
  name: string;
  email?: string;
  major: string;
  year: string;
  interests: string[];
  onboardingComplete?: boolean;
}