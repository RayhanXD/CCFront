export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string; // ISO date string
  description: string;
  matchPercentage: number;
  type: 'merit' | 'need' | 'research' | 'international';
  renewable: boolean;
  tags: string[];
}