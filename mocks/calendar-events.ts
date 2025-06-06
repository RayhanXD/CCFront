import { CalendarEvent } from '@/types/calendar';

export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Test',
    date: new Date(2024, 0, 23).toISOString(),
    time: '1:00 PM',
    duration: 30,
    location: 'UTD',
    description: 'Test event for the calendar',
  },
  {
    id: '2',
    title: 'DECA Meeting',
    date: new Date(2024, 0, 15).toISOString(),
    time: '3:00 PM',
    duration: 60,
    location: 'Business Building, Room 302',
    description: 'Weekly DECA club meeting to discuss upcoming competitions',
  },
  {
    id: '3',
    title: 'Study Group',
    date: new Date(2024, 0, 18).toISOString(),
    time: '5:30 PM',
    duration: 120,
    location: 'Library, Study Room 4',
    description: 'Study group for midterm exam preparation',
  },
  {
    id: '4',
    title: 'Career Fair',
    date: new Date(2024, 0, 25).toISOString(),
    time: '10:00 AM',
    duration: 240,
    location: 'Student Union',
    description: 'Annual career fair with over 50 companies',
  },
  {
    id: '5',
    title: 'Guest Speaker',
    date: new Date().toISOString(), // Today
    time: '2:00 PM',
    duration: 90,
    location: 'Auditorium',
    description: 'Guest speaker from Google discussing AI advancements',
  },
  {
    id: '6',
    title: 'Club Registration',
    date: new Date().toISOString(), // Today
    time: '9:00 AM',
    duration: 45,
    location: 'Student Activities Center',
    description: 'Register for campus clubs and organizations',
  }
];