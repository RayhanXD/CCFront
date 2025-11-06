import { TodayEvent } from '@/types/events';

// Helper to get a future date
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

export const futureEvents: TodayEvent[] = [
  {
    id: 'future-1',
    title: 'Campus Career Expo',
    description: 'Connect with over 50 employers from various industries at our annual Career Expo. This is your chance to network with potential employers, discover internship and job opportunities, and learn about different career paths. Companies from tech, healthcare, finance, marketing, and many other sectors will be present. Bring multiple copies of your resume and dress professionally. There will also be resume review stations and professional headshot opportunities available throughout the event.',
    date: getFutureDate(3),
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    location: 'Student Union Grand Ballroom',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 95,
    organizer: 'Career Services Center',
    tags: ['Career', 'Networking', 'Professional Development']
  },
  {
    id: 'future-2',
    title: 'Blockchain Technology Workshop',
    description: 'Learn the fundamentals of blockchain technology and its applications beyond cryptocurrency. This hands-on workshop will cover the basic concepts of distributed ledger technology, smart contracts, and how blockchain is being used in various industries including finance, supply chain, healthcare, and more. Participants will get to create a simple smart contract and understand how blockchain networks operate. This workshop is suitable for beginners with basic programming knowledge.',
    date: getFutureDate(5),
    startTime: '1:00 PM',
    endTime: '4:00 PM',
    location: 'Technology Building, Room 305',
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 88,
    organizer: 'Computer Science Department',
    tags: ['Blockchain', 'Technology', 'Workshop', 'Tech']
  },
  {
    id: 'future-3',
    title: 'Mental Health Awareness Day',
    description: 'Join us for a day dedicated to mental health awareness and wellness. The event will feature workshops on stress management, mindfulness practices, and maintaining work-life balance. There will be sessions led by mental health professionals, wellness activities, and resources available for students seeking support. This is an opportunity to learn valuable skills for managing academic stress and prioritizing your mental wellbeing throughout your college journey.',
    date: getFutureDate(7),
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    location: 'Student Wellness Center',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 92,
    organizer: 'Student Health Services',
    tags: ['Mental Health', 'Wellness', 'Self-Care']
  },
  {
    id: 'future-4',
    title: 'Startup Weekend',
    description: 'Experience the thrill of building a startup in just 54 hours! Startup Weekend brings together designers, developers, marketers, and business enthusiasts to pitch ideas, form teams, and launch startups. You will work with mentors from successful companies, learn about lean startup methodology, and pitch your final product to a panel of judges. Whether you have an idea or just want to join a team, this is your chance to experience entrepreneurship in action. Prizes include seed funding, mentorship opportunities, and co-working space memberships.',
    date: getFutureDate(10),
    startTime: '5:00 PM',
    endTime: '8:00 PM (Sunday)',
    location: 'Innovation Hub',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 90,
    organizer: 'Entrepreneurship Center',
    tags: ['Startup', 'Entrepreneurship', 'Innovation', 'Business']
  },
  {
    id: 'future-5',
    title: 'Environmental Sustainability Conference',
    description: 'Join environmental experts, activists, and researchers for a day of discussions on climate change, sustainable practices, and conservation efforts. The conference will feature keynote speeches, panel discussions, and interactive workshops on topics including renewable energy, waste reduction, sustainable agriculture, and climate policy. This is an opportunity to learn about the latest research, connect with like-minded individuals, and discover ways to contribute to environmental sustainability efforts on campus and beyond.',
    date: getFutureDate(14),
    startTime: '8:30 AM',
    endTime: '6:00 PM',
    location: 'Science Center Auditorium',
    imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 85,
    organizer: 'Environmental Science Department',
    tags: ['Environment', 'Sustainability', 'Climate', 'Conference']
  },
  {
    id: 'future-6',
    title: 'Alumni Networking Night',
    description: 'Connect with successful alumni from your field of study at this exclusive networking event. Alumni from various industries and career stages will be present to share their experiences, offer advice, and potentially open doors to internship and job opportunities. The evening will include a panel discussion, small group conversations, and open networking time. This is a valuable opportunity to build your professional network, gain industry insights, and learn from those who have successfully navigated the transition from college to career.',
    date: getFutureDate(21),
    startTime: '6:30 PM',
    endTime: '9:00 PM',
    location: 'Alumni Center, Main Hall',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 93,
    organizer: 'Alumni Association',
    tags: ['Networking', 'Alumni', 'Career Development', 'Professional']
  }
];
