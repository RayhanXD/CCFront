import { TodayEvent } from '@/types/events';

export const todayEvents: TodayEvent[] = [
  {
    id: '1',
    title: 'AI & Machine Learning Workshop',
    description: 'Join us for a hands-on workshop on the latest AI and machine learning techniques with industry experts from Google. This workshop will cover fundamental concepts in artificial intelligence and practical applications of machine learning algorithms. Participants will learn how to implement basic neural networks, understand data preprocessing techniques, and explore real-world use cases. The session includes both theoretical discussions and coding exercises, making it suitable for beginners with basic programming knowledge as well as those looking to expand their AI skills.',
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
    description: 'Meet recruiters from top tech companies including Microsoft, Amazon, Google, and local startups. This is your opportunity to connect with potential employers, learn about internship and full-time positions, and practice your networking skills. The career fair will feature over 30 companies from various tech sectors including software development, data science, cybersecurity, and product management. Bring multiple copies of your resume and be prepared for on-site interviews. Professional attire is recommended. There will also be resume review stations and professional headshot opportunities available throughout the event.',
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
    description: 'Undergraduate and graduate students present their research projects across various disciplines including computer science, engineering, biology, psychology, and business. The symposium features both poster presentations and oral presentations, giving students the opportunity to showcase their work and receive feedback from faculty and peers. This is an excellent opportunity to learn about ongoing research at the university, find potential collaboration opportunities, and practice your scientific communication skills. Faculty members will be present to discuss research opportunities in their labs. Refreshments will be provided throughout the event.',
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
    description: 'Join us for an inspiring evening as successful alumni entrepreneurs share their journey from college to founding their own companies. Our distinguished panel includes founders of tech startups, social enterprises, and innovative service businesses who will discuss their experiences, challenges, and lessons learned along the way. Topics will include identifying market opportunities, securing funding, building a team, and scaling a business. The panel discussion will be followed by a Q&A session where you can ask specific questions about entrepreneurship and starting your own venture. This event is perfect for aspiring entrepreneurs, business students, and anyone interested in innovation and startups. Light refreshments and networking opportunities will be available after the formal program.',
    date: new Date().toISOString(),
    startTime: '5:30 PM',
    endTime: '7:00 PM',
    location: 'Business School, Room 105',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 88,
    organizer: 'Entrepreneurship Club',
    tags: ['Entrepreneurship', 'Business', 'Networking']
  },
  {
    id: '5',
    title: 'Hackathon: Sustainability Solutions',
    description: 'A 24-hour coding competition focused on developing innovative solutions for environmental sustainability challenges. Teams of 2-4 students will work together to create prototypes addressing issues like waste reduction, energy efficiency, or sustainable transportation. Prizes include cash awards, internship opportunities, and mentorship from industry experts. No prior hackathon experience is required, and students from all majors are welcome to participate. Food, drinks, and snacks will be provided throughout the event. Bring your laptop, charger, and enthusiasm for making a positive impact!',
    date: new Date().toISOString(),
    startTime: '10:00 AM',
    endTime: '10:00 AM (next day)',
    location: 'Innovation Center, Main Hall',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 96,
    organizer: 'Student Technology Association',
    tags: ['Hackathon', 'Sustainability', 'Coding', 'Innovation']
  },
  {
    id: '6',
    title: 'International Cultural Festival',
    description: 'Celebrate the diversity of our campus community at the annual International Cultural Festival! Experience cultures from around the world through food, performances, art, and interactive displays. Student organizations representing different countries and regions will showcase their traditions, cuisine, and cultural heritage. The festival features live music and dance performances, cultural workshops, international food tastings, and a global marketplace. This is a family-friendly event open to students, faculty, staff, and the wider community. Come expand your cultural horizons and connect with the global community on campus!',
    date: new Date().toISOString(),
    startTime: '12:00 PM',
    endTime: '8:00 PM',
    location: 'Campus Green',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    relevanceScore: 90,
    organizer: 'International Student Association',
    tags: ['Cultural', 'Festival', 'International', 'Community']
  }
];