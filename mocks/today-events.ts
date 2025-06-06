import { TodayEvent } from '@/types/events';

export const todayEvents: TodayEvent[] = [
  {
    id: '1',
    title: 'AI & Machine Learning Workshop',
    description: 'Join us for a hands-on workshop on the latest AI and machine learning techniques with industry experts from Google.',
    date: new Date().toISOString(),
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Engineering Building, Room 302',
    imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 98,
    organizer: 'Computer Science Department',
    tags: ['AI', 'Machine Learning', 'Workshop', 'Tech']
  },
  {
    id: '2',
    title: 'Career Fair: Tech Companies',
    description: 'Meet recruiters from top tech companies including Microsoft, Amazon, and local startups. Bring your resume and be prepared for on-site interviews.',
    date: new Date().toISOString(),
    startTime: '10:00 AM',
    endTime: '3:00 PM',
    location: 'Student Union Ballroom',
    imageUrl: 'https://images.unsplash.com/photo-1560523159-4a9692d222f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 95,
    organizer: 'Career Services',
    tags: ['Career', 'Networking', 'Tech', 'Recruiting']
  },
  {
    id: '3',
    title: 'Research Symposium',
    description: 'Undergraduate and graduate students present their research projects. Great opportunity to learn about ongoing research and potential collaboration.',
    date: new Date().toISOString(),
    startTime: '1:00 PM',
    endTime: '5:00 PM',
    location: 'Science Building, Auditorium',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 92,
    organizer: 'Office of Research',
    tags: ['Research', 'Academic', 'Presentation']
  },
  {
    id: '4',
    title: 'Entrepreneurship Panel',
    description: 'Successful alumni entrepreneurs share their journey from college to founding their own companies. Q&A session included.',
    date: new Date().toISOString(),
    startTime: '5:30 PM',
    endTime: '7:00 PM',
    location: 'Business School, Room 105',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 88,
    organizer: 'Entrepreneurship Club',
    tags: ['Entrepreneurship', 'Business', 'Networking']
  }
];