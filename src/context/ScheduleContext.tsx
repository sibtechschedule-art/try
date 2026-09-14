import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  SchoolSettings,
  Subject,
  Teacher,
  Classroom,
  ScheduleSlot,
  SubstitutionRecord,
  ConflictBottleneck
} from '../types';
import { generateMasterSchedule } from '../services/scheduleGenerator';
import { scanScheduleBottlenecks, autoResolveBottleneck } from '../services/conflictAssistant';

const defaultSettings: SchoolSettings = {
  operatingStartTime: '08:00',
  operatingEndTime: '16:00',
  periodDurationMinutes: 60,
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  lunchBreakStart: '12:00',
  lunchBreakEnd: '13:00'
};

const defaultSubjects: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', code: 'MATH101', gradeLevel: 'Grade 9', weeklyFrequency: 5, color: '#3b82f6' },
  { id: 'sub-2', name: 'Physics & General Science', code: 'SCI102', gradeLevel: 'Grade 9', weeklyFrequency: 4, color: '#10b981' },
  { id: 'sub-3', name: 'English Literature', code: 'ENG103', gradeLevel: 'Grade 9', weeklyFrequency: 4, color: '#f59e0b' },
  { id: 'sub-4', name: 'World History', code: 'HIS104', gradeLevel: 'Grade 10', weeklyFrequency: 3, color: '#8b5cf6' },
  { id: 'sub-5', name: 'Computer Science', code: 'CS105', gradeLevel: 'Grade 10', weeklyFrequency: 4, color: '#ec4899' },
  { id: 'sub-6', name: 'Physical Education', code: 'PE106', gradeLevel: 'Grade 10', weeklyFrequency: 2, color: '#06b6d4' }
];

const defaultTeachers: Teacher[] = [
  {
    id: 'tch-1',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@school.edu',
    qualifiedSubjectIds: ['sub-1', 'sub-5'],
    maxWeeklyHours: 20,
    buildingLocation: 'Science Wing - Bldg A',
    blockedDays: [],
    availableTimeSlots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'tch-2',
    name: 'Prof. Marcus Vance',
    email: 'm.vance@school.edu',
    qualifiedSubjectIds: ['sub-2'],
    maxWeeklyHours: 18,
    buildingLocation: 'Science Wing - Bldg A',
    blockedDays: ['Friday'],
    availableTimeSlots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'tch-3',
    name: 'Ms. Elena Rostova',
    email: 'e.rostova@school.edu',
    qualifiedSubjectIds: ['sub-3', 'sub-4'],
    maxWeeklyHours: 22,
    buildingLocation: 'Humanities Hall - Bldg B',
    blockedDays: [],
    availableTimeSlots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'tch-4',
    name: 'Coach David Miller',
    email: 'd.miller@school.edu',
    qualifiedSubjectIds: ['sub-6'],
    maxWeeklyHours: 15,
    buildingLocation: 'Athletics Complex - Bldg C',
    blockedDays: [],
    availableTimeSlots: ['09:00', '10:00', '11:00', '13:00', '14:00'],
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  },
  {
    id: 'tch-5',
    name: 'Dr. Alan Turing',
    email: 'a.turing@school.edu',
    qualifiedSubjectIds: ['sub-1', 'sub-5'],
    maxWeeklyHours: 20,
    buildingLocation: 'Technology Center - Bldg D',
    blockedDays: [],
    availableTimeSlots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  }
];

const defaultClassrooms: Classroom[] = [
  { id: 'room-101', roomNumber: 'Room 101', name: 'Mathematics Lab A', capacity: 35, building: 'Science Wing - Bldg A', availableFrom: '08:00', availableTo: '16:00' },
  { id: 'room-102', roomNumber: 'Room 102', name: 'Physics & Chemistry Lab', capacity: 30, building: 'Science Wing - Bldg A', availableFrom: '08:00', availableTo: '16:00' },
  { id: 'room-201', roomNumber: 'Room 201', name: 'Literature Lecture Room', capacity: 40, building: 'Humanities Hall - Bldg B', availableFrom: '08:00', availableTo: '16:00' },
  { id: 'room-301', roomNumber: 'Room 301', name: 'Gymnasium & Field', capacity: 60, building: 'Athletics Complex - Bldg C', availableFrom: '08:00', availableTo: '16:00' }
];

interface ScheduleContextType {
  settings: SchoolSettings;
  subjects: Subject[];
  teachers: Teacher[];
  classrooms: Classroom[];
  masterSchedule: ScheduleSlot[];
  substitutions: SubstitutionRecord[];
  bottlenecks: ConflictBottleneck[];
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Actions
  updateSettings: (newSettings: SchoolSettings) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  addClassroom: (classroom: Omit<Classroom, 'id'>) => void;
  updateClassroom: (classroom: Classroom) => void;
  deleteClassroom: (id: string) => void;

  // Schedule Generators & Slot Actions
  handleGenerateSchedule: () => void;
  updateScheduleSlot: (slot: ScheduleSlot) => void;
  applySubstitution: (slotId: string, substituteTeacherId: string, reason?: string) => void;
  resolveBottleneck: (bottleneckId: string) => void;
  checkTeacherConflict: (teacherId: string, day: string, startTime: string, excludeSlotId?: string) => boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);
  const [teachers, setTeachers] = useState<Teacher[]>(defaultTeachers);
  const [classrooms, setClassrooms] = useState<Classroom[]>(defaultClassrooms);
  const [masterSchedule, setMasterSchedule] = useState<ScheduleSlot[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionRecord[]>([]);
  const [bottlenecks, setBottlenecks] = useState<ConflictBottleneck[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Initialize schedule on mount
  useEffect(() => {
    const initialSlots = generateMasterSchedule(settings, subjects, teachers, classrooms);
    setMasterSchedule(initialSlots);
  }, []);

  // Update conflict bottlenecks whenever schedule changes
  useEffect(() => {
    const detected = scanScheduleBottlenecks(masterSchedule, teachers, classrooms, subjects);
    setBottlenecks(detected);
  }, [masterSchedule, teachers, classrooms, subjects]);

  const updateSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
  };

  const addSubject = (sub: Omit<Subject, 'id'>) => {
    const newSub: Subject = { ...sub, id: `sub-${Date.now()}` };
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (sub: Subject) => {
    setSubjects(prev => prev.map(s => (s.id === sub.id ? sub : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const addTeacher = (tch: Omit<Teacher, 'id'>) => {
    const newTch: Teacher = { ...tch, id: `tch-${Date.now()}` };
    setTeachers(prev => [...prev, newTch]);
  };

  const updateTeacher = (tch: Teacher) => {
    setTeachers(prev => prev.map(t => (t.id === tch.id ? tch : t)));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const addClassroom = (cls: Omit<Classroom, 'id'>) => {
    const newCls: Classroom = { ...cls, id: `room-${Date.now()}` };
    setClassrooms(prev => [...prev, newCls]);
  };

  const updateClassroom = (cls: Classroom) => {
    setClassrooms(prev => prev.map(c => (c.id === cls.id ? cls : c)));
  };

  const deleteClassroom = (id: string) => {
    setClassrooms(prev => prev.filter(c => c.id !== id));
  };

  const handleGenerateSchedule = () => {
    const newSchedule = generateMasterSchedule(settings, subjects, teachers, classrooms);
    setMasterSchedule(newSchedule);
  };

  const updateScheduleSlot = (updatedSlot: ScheduleSlot) => {
    setMasterSchedule(prev => prev.map(s => (s.id === updatedSlot.id ? updatedSlot : s)));
  };

  const applySubstitution = (slotId: string, substituteTeacherId: string, reason = 'Emergency absence') => {
    setMasterSchedule(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          const originalTeacherId = slot.originalTeacherId || slot.teacherId;
          const subRecord: SubstitutionRecord = {
            id: `subrec-${Date.now()}`,
            slotId,
            originalTeacherId,
            substituteTeacherId,
            date: new Date().toISOString().split('T')[0],
            reason,
            status: 'active'
          };
          setSubstitutions(sPrev => [subRecord, ...sPrev]);
          return {
            ...slot,
            originalTeacherId,
            substituteTeacherId,
            isSubstituted: true
          };
        }
        return slot;
      })
    );
  };

  const resolveBottleneck = (bottleneckId: string) => {
    const btn = bottlenecks.find(b => b.id === bottleneckId);
    if (!btn) return;
    const resolvedSlots = autoResolveBottleneck(btn, masterSchedule, teachers, classrooms);
    setMasterSchedule(resolvedSlots);
  };

  const checkTeacherConflict = (teacherId: string, day: string, startTime: string, excludeSlotId?: string): boolean => {
    return masterSchedule.some(slot => {
      if (excludeSlotId && slot.id === excludeSlotId) return false;
      const activeTeacher = slot.substituteTeacherId || slot.teacherId;
      return activeTeacher === teacherId && slot.day === day && slot.startTime === startTime;
    });
  };

  return (
    <ScheduleContext.Provider
      value={{
        settings,
        subjects,
        teachers,
        classrooms,
        masterSchedule,
        substitutions,
        bottlenecks,
        activeTab,
        setActiveTab,
        updateSettings,
        addSubject,
        updateSubject,
        deleteSubject,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        handleGenerateSchedule,
        updateScheduleSlot,
        applySubstitution,
        resolveBottleneck,
        checkTeacherConflict
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
