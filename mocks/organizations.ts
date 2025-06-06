import { Organization } from '@/types/campus';

export const organizations: Organization[] = [
  {
    id: '1',
    name: 'DECA',
    description: 'DECA is an educational organization that prepares emerging leaders and entrepreneurs in marketing, finance, hospitality, and management in high schools and colleges around the globe.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 94,
    president: {
      name: 'Sindhu Bajjuri',
      role: 'President'
    },
    type: 'organization',
    meetingTime: 'Weekly meetings on Tuesdays at 5:00 PM',
    location: 'Student Union, Room 2.502'
  },
  {
    id: '2',
    name: 'Comet Solar Racing',
    description: 'Comet Solar Racing at The University of Texas at Dallas is a student-run and student-elected competition team focused on providing students with hands-on engineering experience.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 94,
    president: {
      name: 'Syed Zaidi',
      role: 'President'
    },
    type: 'organization',
    meetingTime: 'Bi-weekly meetings on Thursdays at 6:30 PM',
    location: 'Engineering Building, Lab 3.204'
  },
  {
    id: '3',
    name: 'Graduate Finance Management Council (GFMC)',
    description: 'The Graduate Finance Management Council (GFMC) is focused on the needs and interests of graduate finance students. The dedicated GFMC members work to enhance the academic experience.',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 94,
    president: {
      name: 'Alex Johnson',
      role: 'President'
    },
    type: 'organization',
    meetingTime: 'Monthly meetings on first Friday at 4:00 PM',
    location: 'Business Building, Conference Room A'
  },
  {
    id: '4',
    name: 'Data Science Workshop',
    description: 'Learn the fundamentals of data science and machine learning in this hands-on workshop led by industry professionals.',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 88,
    president: {
      name: 'Maya Patel',
      role: 'Organizer'
    },
    type: 'event',
    meetingTime: 'Saturday, March 15th at 10:00 AM',
    location: 'Computer Science Building, Room 1.315'
  },
  {
    id: '5',
    name: 'Calculus Tutoring',
    description: 'Get help with calculus concepts, problem-solving strategies, and exam preparation from experienced tutors.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 91,
    president: {
      name: 'Carlos Rodriguez',
      role: 'Lead Tutor'
    },
    type: 'tutoring',
    meetingTime: 'Available Monday-Friday, 2:00-6:00 PM',
    location: 'Library, Study Room 204'
  }
];