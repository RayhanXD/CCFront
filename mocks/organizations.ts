import { Organization } from '@/types/campus';

export const organizations: Organization[] = [
  {
    id: '1',
    name: 'DECA',
    description: 'DECA is an educational organization that prepares emerging leaders and entrepreneurs in marketing, finance, hospitality, and management in high schools and colleges around the globe. Our chapter focuses on professional development, networking opportunities, and competitive events that allow students to apply classroom learning to real-world business scenarios. We welcome students from all majors who are interested in developing their leadership skills and business acumen.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 94,
    president: {
      name: 'Sindhu Bajjuri',
      role: 'President'
    },
    type: 'organization',
    meetingTime: 'Weekly meetings on Tuesdays at 5:00 PM',
    location: 'Student Union, Room 2.502',
    category: 'Business & Entrepreneurship',
    memberCount: 75,
    meetingSchedule: 'Weekly meetings on Tuesdays at 5:00 PM',
    email: 'deca@university.edu',
    website: 'https://university-deca.org',
    benefits: [
      'Professional development workshops',
      'Networking with industry professionals',
      'Leadership opportunities',
      'Competitive events and conferences',
      'Resume building'
    ],
    events: [
      {
        id: 'e1',
        title: 'New Member Orientation',
        date: '2025-10-18',
        time: '5:00 PM',
        location: 'Student Union, Room 2.502',
        status: 'Next Week'
      },
      {
        id: 'e2',
        title: 'Marketing Workshop',
        date: '2025-10-25',
        time: '6:00 PM',
        location: 'Business Building, Room 3.104',
        status: 'Upcoming'
      }
    ]
  },
  {
    id: '2',
    name: 'Comet Solar Racing',
    description: 'Comet Solar Racing at The University of Texas at Dallas is a student-run and student-elected competition team focused on providing students with hands-on engineering experience. Our team designs, builds, and races solar-powered vehicles in competitions across the country. Members gain practical experience in mechanical engineering, electrical systems, aerodynamics, project management, and teamwork.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 94,
    president: {
      name: 'Syed Zaidi',
      role: 'President'
    },
    type: 'organization',
    meetingTime: 'Bi-weekly meetings on Thursdays at 6:30 PM',
    location: 'Engineering Building, Lab 3.204',
    category: 'Engineering',
    memberCount: 42,
    meetingSchedule: 'Bi-weekly meetings on Thursdays at 6:30 PM',
    email: 'solarracing@university.edu',
    website: 'https://cometsolarracing.org',
    benefits: [
      'Hands-on engineering experience',
      'Team-based project management',
      'Competition opportunities',
      'Technical skills development',
      'Industry connections'
    ],
    events: [
      {
        id: 'e3',
        title: 'Solar Car Design Workshop',
        date: '2025-10-20',
        time: '4:00 PM',
        location: 'Engineering Building, Lab 3.204',
        status: 'Next Week'
      }
    ]
  },
  {
    id: '3',
    name: 'Graduate Finance Management Council (GFMC)',
    description: 'The Graduate Finance Management Council (GFMC) is focused on the needs and interests of graduate finance students. The dedicated GFMC members work to enhance the academic experience through professional development events, networking opportunities, and career resources. We collaborate with finance industry professionals to provide valuable insights and connections for our members.',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 94,
    president: {
      name: 'Alex Johnson',
      role: 'President'
    },
    type: 'organization',
    meetingTime: 'Monthly meetings on first Friday at 4:00 PM',
    location: 'Business Building, Conference Room A',
    category: 'Finance & Business',
    memberCount: 35,
    meetingSchedule: 'Monthly meetings on first Friday at 4:00 PM',
    email: 'gfmc@university.edu',
    website: 'https://university-gfmc.org',
    benefits: [
      'Industry networking events',
      'Resume workshops',
      'Interview preparation',
      'Financial modeling workshops',
      'Mentorship opportunities'
    ],
    events: [
      {
        id: 'e4',
        title: 'Finance Industry Panel',
        date: '2025-11-05',
        time: '5:30 PM',
        location: 'Business Building, Auditorium',
        status: 'Upcoming'
      },
      {
        id: 'e5',
        title: 'Resume Workshop',
        date: '2025-10-22',
        time: '4:00 PM',
        location: 'Career Center, Workshop Room',
        status: 'Next Week'
      }
    ]
  },
  {
    id: '4',
    name: 'Data Science Workshop',
    description: 'Learn the fundamentals of data science and machine learning in this hands-on workshop led by industry professionals. This workshop series covers Python programming, data visualization, statistical analysis, and machine learning algorithms. Participants will work on real-world projects and build a portfolio of data science work.',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 88,
    president: {
      name: 'Maya Patel',
      role: 'Organizer'
    },
    type: 'event',
    meetingTime: 'Saturday, March 15th at 10:00 AM',
    location: 'Computer Science Building, Room 1.315',
    category: 'Technology',
    memberCount: 120,
    meetingSchedule: 'Weekly workshops on Saturdays at 10:00 AM',
    email: 'datascience@university.edu',
    website: 'https://university-datascience.org',
    benefits: [
      'Hands-on coding experience',
      'Portfolio development',
      'Industry mentorship',
      'Networking with tech companies',
      'Certificate of completion'
    ],
    events: [
      {
        id: 'e6',
        title: 'Python for Data Analysis',
        date: '2025-10-19',
        time: '10:00 AM',
        location: 'Computer Science Building, Room 1.315',
        status: 'This Weekend'
      },
      {
        id: 'e7',
        title: 'Machine Learning Basics',
        date: '2025-10-26',
        time: '10:00 AM',
        location: 'Computer Science Building, Room 1.315',
        status: 'Upcoming'
      }
    ]
  },
  {
    id: '5',
    name: 'Calculus Tutoring',
    description: 'Get help with calculus concepts, problem-solving strategies, and exam preparation from experienced tutors. Our tutoring service covers Calculus I, II, and III, as well as Differential Equations. We offer both one-on-one sessions and small group tutoring to accommodate different learning styles and needs.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    matchPercentage: 91,
    president: {
      name: 'Carlos Rodriguez',
      role: 'Lead Tutor'
    },
    type: 'tutoring',
    meetingTime: 'Available Monday-Friday, 2:00-6:00 PM',
    location: 'Library, Study Room 204',
    category: 'Academic Support',
    memberCount: 15,
    meetingSchedule: 'Available Monday-Friday, 2:00-6:00 PM',
    email: 'calculus@university.edu',
    website: 'https://university-tutoring.org/calculus',
    benefits: [
      'One-on-one tutoring',
      'Small group sessions',
      'Exam preparation',
      'Homework help',
      'Conceptual understanding'
    ],
    events: [
      {
        id: 'e8',
        title: 'Calculus I Exam Review',
        date: '2025-10-21',
        time: '4:00 PM',
        location: 'Library, Study Room 204',
        status: 'Next Week'
      },
      {
        id: 'e9',
        title: 'Calculus II Workshop',
        date: '2025-10-23',
        time: '3:00 PM',
        location: 'Math Building, Room 2.105',
        status: 'Upcoming'
      }
    ]
  }
];