import { Scholarship } from '@/types/scholarship';

export const scholarships: Scholarship[] = [
  {
    id: '1',
    name: 'Presidential Merit Scholarship',
    provider: 'University of Texas at Dallas',
    amount: 12000,
    deadline: '2024-03-15',
    description: 'The Presidential Merit Scholarship is awarded to incoming freshmen who have demonstrated exceptional academic achievement and leadership potential.',
    matchPercentage: 96,
    type: 'merit',
    renewable: true,
    tags: ['Freshman', 'Academic']
  },
  {
    id: '2',
    name: 'Computer Science Research Grant',
    provider: 'Erik Jonsson School of Engineering',
    amount: 5000,
    deadline: '2024-04-30',
    description: 'This grant supports undergraduate students conducting research in computer science, data science, or related fields under faculty supervision.',
    matchPercentage: 92,
    type: 'research',
    renewable: false,
    tags: ['CS', 'Research']
  },
  {
    id: '3',
    name: 'International Student Scholarship',
    provider: 'Office of International Education',
    amount: 8000,
    deadline: '2024-02-28',
    description: 'This scholarship is designed to support international students who demonstrate academic excellence and financial need.',
    matchPercentage: 88,
    type: 'international',
    renewable: true,
    tags: ['International', 'Undergraduate']
  },
  {
    id: '4',
    name: 'Financial Need Grant',
    provider: 'Student Financial Aid Office',
    amount: 6500,
    deadline: '2024-03-01',
    description: 'This grant is awarded to students who demonstrate significant financial need based on their FAFSA application.',
    matchPercentage: 94,
    type: 'need',
    renewable: true,
    tags: ['FAFSA', 'Need-based']
  },
  {
    id: '5',
    name: 'Women in STEM Scholarship',
    provider: 'Society of Women Engineers',
    amount: 3000,
    deadline: '2024-05-15',
    description: 'This scholarship supports women pursuing degrees in science, technology, engineering, and mathematics fields.',
    matchPercentage: 90,
    type: 'merit',
    renewable: false,
    tags: ['Women', 'STEM']
  },
  {
    id: '6',
    name: 'Graduate Research Fellowship',
    provider: 'School of Natural Sciences',
    amount: 15000,
    deadline: '2024-01-15', // Past deadline
    description: 'This fellowship supports graduate students conducting innovative research in natural sciences and mathematics.',
    matchPercentage: 85,
    type: 'research',
    renewable: true,
    tags: ['Graduate', 'Research']
  },
  {
    id: '7',
    name: 'First Generation Scholarship',
    provider: 'Student Success Center',
    amount: 4000,
    deadline: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    description: 'This scholarship is awarded to first-generation college students who demonstrate academic potential and financial need.',
    matchPercentage: 93,
    type: 'need',
    renewable: true,
    tags: ['First-Gen', 'Undergraduate']
  }
];