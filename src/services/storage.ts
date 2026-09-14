import type { SchoolSettings, Subject, Teacher, Classroom, ScheduleSlot, ArchivedSchedule } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'schedulify_settings',
  SUBJECTS: 'schedulify_subjects',
  TEACHERS: 'schedulify_teachers',
  CLASSROOMS: 'schedulify_classrooms',
  SCHEDULE: 'schedulify_schedule',
  ARCHIVES: 'schedulify_archives',
};

// Default initial data for college Schedulify
export const DEFAULT_SETTINGS: SchoolSettings = {
  dailyOperatingHours: {
    Monday: { enabled: true, startTime: '07:00', endTime: '18:00' },
    Tuesday: { enabled: true, startTime: '07:00', endTime: '18:00' },
    Wednesday: { enabled: true, startTime: '07:00', endTime: '18:00' },
    Thursday: { enabled: true, startTime: '07:00', endTime: '18:00' },
    Friday: { enabled: true, startTime: '07:00', endTime: '18:00' },
  },
  periodDurationMinutes: 60,
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'CS101 - Intro to Computer Science',
    code: 'CS101',
    yearLevel: '1st Year',
    weeklyFrequency: 3,
    sessionDurationHours: 1,
    color: '#3B82F6',
  },
  {
    id: 'sub-2',
    name: 'MATH201 - Advanced Calculus',
    code: 'MATH201',
    yearLevel: '2nd Year',
    weeklyFrequency: 2,
    sessionDurationHours: 1.5,
    color: '#10B981',
  },
  {
    id: 'sub-3',
    name: 'PHYS102 - University Physics II',
    code: 'PHYS102',
    yearLevel: '1st Year',
    weeklyFrequency: 2,
    sessionDurationHours: 2,
    color: '#F59E0B',
  },
  {
    id: 'sub-4',
    name: 'CS305 - Database Systems & SQL',
    code: 'CS305',
    yearLevel: '3rd Year',
    weeklyFrequency: 3,
    sessionDurationHours: 1.5,
    color: '#8B5CF6',
  },
  {
    id: 'sub-5',
    name: 'CS499 - Senior Capstone Project',
    code: 'CS499',
    yearLevel: '4th Year',
    weeklyFrequency: 2,
    sessionDurationHours: 2,
    color: '#EC4899',
  },
];

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'tech-1',
    name: 'Dr. Sarah Jenkins',
    qualifiedSubjectIds: ['sub-1', 'sub-4'],
    maxWeeklyHours: 18,
    dailyAvailability: {
      Monday: { enabled: true, startTime: '07:00', endTime: '16:00' },
      Tuesday: { enabled: true, startTime: '07:00', endTime: '16:00' },
      Wednesday: { enabled: true, startTime: '07:00', endTime: '16:00' },
      Thursday: { enabled: true, startTime: '07:00', endTime: '16:00' },
      Friday: { enabled: true, startTime: '07:00', endTime: '12:00' },
    },
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'tech-2',
    name: 'Prof. Marcus Vance',
    qualifiedSubjectIds: ['sub-3', 'sub-2'],
    maxWeeklyHours: 15,
    dailyAvailability: {
      Monday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      Tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      Wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      Thursday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      Friday: { enabled: false, startTime: '08:00', endTime: '12:00' },
    },
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'tech-3',
    name: 'Ms. Elena Rostova',
    qualifiedSubjectIds: ['sub-2', 'sub-5'],
    maxWeeklyHours: 20,
    dailyAvailability: {
      Monday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      Tuesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      Wednesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      Thursday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      Friday: { enabled: true, startTime: '09:00', endTime: '18:00' },
    },
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'tech-4',
    name: 'Dr. Robert Chen',
    qualifiedSubjectIds: ['sub-1', 'sub-5'],
    maxWeeklyHours: 16,
    dailyAvailability: {
      Monday: { enabled: true, startTime: '07:00', endTime: '15:00' },
      Tuesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
      Wednesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
      Thursday: { enabled: true, startTime: '07:00', endTime: '15:00' },
      Friday: { enabled: true, startTime: '07:00', endTime: '15:00' },
    },
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
  },
];

export const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: 'room-101', roomNumber: 'Room 101' },
  { id: 'room-102', roomNumber: 'Room 102' },
  { id: 'room-201', roomNumber: 'Lab 201' },
  { id: 'room-301', roomNumber: 'Auditorium 301' },
];

export const storage = {
  getSettings: (): SchoolSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: SchoolSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
  },
  saveSubjects: (subjects: Subject[]) => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  getTeachers: (): Teacher[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return data ? JSON.parse(data) : DEFAULT_TEACHERS;
  },
  saveTeachers: (teachers: Teacher[]) => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  getClassrooms: (): Classroom[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
    return data ? JSON.parse(data) : DEFAULT_CLASSROOMS;
  },
  saveClassrooms: (classrooms: Classroom[]) => {
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
  },

  getSchedule: (): ScheduleSlot[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    return data ? JSON.parse(data) : [];
  },
  saveSchedule: (slots: ScheduleSlot[]) => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(slots));
  },

  getArchives: (): ArchivedSchedule[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    return data ? JSON.parse(data) : [];
  },
  saveArchives: (archives: ArchivedSchedule[]) => {
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
  },
};
