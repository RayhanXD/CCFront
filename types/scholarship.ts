export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string; // ISO date string
  description: string;
  matchPercentage: number;
  category: string; // API categories like "No Essay Scholarships", "High to Low Award", etc.
  renewable: boolean;
  tags: string[];
  url?: string; // Scholarship URL (e.g., "Scholarship URL" from API)
}