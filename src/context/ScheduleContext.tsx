import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  SchoolSettings,
  Subject,
  Teacher,
  Classroom,
  ScheduleSlot,
  SubstitutionRecord,
  ConflictBottleneck,
  ArchivedSchedule,
  DayOfWeek,
  DayTimeRange
} from '../types';
import { storage } from '../services/storage';
import { generateMasterSchedule, jumbleRoomAssignments } from '../services/scheduleGenerator';
import { scanScheduleBottlenecks, autoResolveBottleneck } from '../services/conflictAssistant';

interface ScheduleContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: SchoolSettings) => void;
  updateDailyOperatingHours: (day: DayOfWeek, range: DayTimeRange) => void;
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  classrooms: Classroom[];
  addClassroom: (room: Omit<Classroom, 'id'>) => void;
  updateClassroom: (id: string, room: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;
  scheduleSlots: ScheduleSlot[];
  updateSlot: (id: string, updatedFields: Partial<ScheduleSlot>) => void;
  deleteSlot: (id: string) => void;
  generateSchedule: () => void;
  jumbleRooms: () => void;
  substitutions: SubstitutionRecord[];
  assignSubstitute: (slotId: string, substituteTeacherId: string, reason?: string) => void;
  removeSubstitute: (slotId: string) => void;
  bottlenecks: ConflictBottleneck[];
  fixBottleneck: (bottleneckId: string) => void;
  // Historical archives
  archives: ArchivedSchedule[];
  selectedArchiveId: string | null;
  selectArchive: (archiveId: string | null) => void;
  saveCurrentWeekToArchive: (weekLabel: string) => void;
  deleteArchive: (archiveId: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<SchoolSettings>(() => storage.getSettings());
  const [subjects, setSubjectsState] = useState<Subject[]>(() => storage.getSubjects());
  const [teachers, setTeachersState] = useState<Teacher[]>(() => storage.getTeachers());
  const [classrooms, setClassroomsState] = useState<Classroom[]>(() => storage.getClassrooms());
  const [scheduleSlots, setScheduleSlotsState] = useState<ScheduleSlot[]>(() => storage.getSchedule());
  const [substitutions, setSubstitutions] = useState<SubstitutionRecord[]>([]);
  const [archives, setArchivesState] = useState<ArchivedSchedule[]>(() => storage.getArchives());
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);

  // Initialize schedule if empty on first load
  useEffect(() => {
    if (scheduleSlots.length === 0) {
      const initial = generateMasterSchedule(subjects, teachers, classrooms, settings);
      setScheduleSlotsState(initial);
      storage.saveSchedule(initial);
    }
  }, []);

  // Update Settings
  const updateSettings = (newSettings: SchoolSettings) => {
    setSettingsState(newSettings);
    storage.saveSettings(newSettings);
  };

  const updateDailyOperatingHours = (day: DayOfWeek, range: DayTimeRange) => {
    const updatedSettings: SchoolSettings = {
      ...settings,
      dailyOperatingHours: {
        ...settings.dailyOperatingHours,
        [day]: range,
      },
    };
    setSettingsState(updatedSettings);
    storage.saveSettings(updatedSettings);
  };

  // Subjects CRUD
  const addSubject = (sub: Omit<Subject, 'id'>) => {
    const newSub: Subject = { ...sub, id: `sub-${Date.now()}` };
    const updated = [...subjects, newSub];
    setSubjectsState(updated);
    storage.saveSubjects(updated);
  };

  const updateSubject = (id: string, updatedFields: Partial<Subject>) => {
    const updated = subjects.map(s => (s.id === id ? { ...s, ...updatedFields } : s));
    setSubjectsState(updated);
    storage.saveSubjects(updated);
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjectsState(updated);
    storage.saveSubjects(updated);
  };

  // Teachers CRUD
  const addTeacher = (t: Omit<Teacher, 'id'>) => {
    const newT: Teacher = { ...t, id: `tech-${Date.now()}` };
    const updated = [...teachers, newT];
    setTeachersState(updated);
    storage.saveTeachers(updated);
  };

  const updateTeacher = (id: string, updatedFields: Partial<Teacher>) => {
    const updated = teachers.map(t => (t.id === id ? { ...t, ...updatedFields } : t));
    setTeachersState(updated);
    storage.saveTeachers(updated);
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachersState(updated);
    storage.saveTeachers(updated);
  };

  // Classrooms CRUD
  const addClassroom = (c: Omit<Classroom, 'id'>) => {
    const newC: Classroom = { ...c, id: `room-${Date.now()}` };
    const updated = [...classrooms, newC];
    setClassroomsState(updated);
    storage.saveClassrooms(updated);
  };

  const updateClassroom = (id: string, updatedFields: Partial<Classroom>) => {
    const updated = classrooms.map(c => (c.id === id ? { ...c, ...updatedFields } : c));
    setClassroomsState(updated);
    storage.saveClassrooms(updated);
  };

  const deleteClassroom = (id: string) => {
    const updated = classrooms.filter(c => c.id !== id);
    setClassroomsState(updated);
    storage.saveClassrooms(updated);
  };

  // Schedule Slot Management
  const updateSlot = (id: string, updatedFields: Partial<ScheduleSlot>) => {
    const updated = scheduleSlots.map(s => (s.id === id ? { ...s, ...updatedFields } : s));
    setScheduleSlotsState(updated);
    storage.saveSchedule(updated);
  };

  const deleteSlot = (id: string) => {
    const updated = scheduleSlots.filter(s => s.id !== id);
    setScheduleSlotsState(updated);
    storage.saveSchedule(updated);
  };

  const generateSchedule = () => {
    const newSchedule = generateMasterSchedule(subjects, teachers, classrooms, settings);
    setScheduleSlotsState(newSchedule);
    storage.saveSchedule(newSchedule);
    setSelectedArchiveId(null);
  };

  const jumbleRooms = () => {
    const jumbled = jumbleRoomAssignments(scheduleSlots, classrooms);
    setScheduleSlotsState(jumbled);
    storage.saveSchedule(jumbled);
  };

  // Substitution logic
  const assignSubstitute = (slotId: string, substituteTeacherId: string, reason = 'Emergency Absence') => {
    const slot = scheduleSlots.find(s => s.id === slotId);
    if (!slot) return;

    const originalTeacherId = slot.substituteTeacherId || slot.teacherId;

    const updated = scheduleSlots.map(s => {
      if (s.id === slotId) {
        return {
          ...s,
          substituteTeacherId,
          isSubstituted: true,
          originalTeacherId: s.originalTeacherId || s.teacherId,
        };
      }
      return s;
    });

    const newSubRecord: SubstitutionRecord = {
      id: `subrec-${Date.now()}`,
      slotId,
      originalTeacherId,
      substituteTeacherId,
      date: new Date().toISOString().split('T')[0],
      reason,
      status: 'active',
    };

    setScheduleSlotsState(updated);
    storage.saveSchedule(updated);
    setSubstitutions(prev => [newSubRecord, ...prev]);
  };

  const removeSubstitute = (slotId: string) => {
    const updated = scheduleSlots.map(s => {
      if (s.id === slotId) {
        return {
          ...s,
          substituteTeacherId: undefined,
          isSubstituted: false,
        };
      }
      return s;
    });

    setScheduleSlotsState(updated);
    storage.saveSchedule(updated);
    setSubstitutions(prev => prev.filter(sub => sub.slotId !== slotId));
  };

  // Bottlenecks & Auto-fix
  const activeSlots = selectedArchiveId
    ? archives.find(a => a.id === selectedArchiveId)?.slots || scheduleSlots
    : scheduleSlots;

  const bottlenecks = scanScheduleBottlenecks(activeSlots, teachers, classrooms, subjects);

  const fixBottleneck = (bottleneckId: string) => {
    const b = bottlenecks.find(btn => btn.id === bottleneckId);
    if (!b) return;

    const resolved = autoResolveBottleneck(b, activeSlots, teachers, classrooms);
    if (!selectedArchiveId) {
      setScheduleSlotsState(resolved);
      storage.saveSchedule(resolved);
    }
  };

  // Historical archives
  const selectArchive = (archiveId: string | null) => {
    setSelectedArchiveId(archiveId);
  };

  const saveCurrentWeekToArchive = (weekLabel: string) => {
    const newArchive: ArchivedSchedule = {
      id: `arch-${Date.now()}`,
      name: `Schedule - ${weekLabel}`,
      weekLabel,
      createdAt: new Date().toLocaleDateString(),
      slots: [...scheduleSlots],
    };
    const updatedArchives = [newArchive, ...archives];
    setArchivesState(updatedArchives);
    storage.saveArchives(updatedArchives);
  };

  const deleteArchive = (archiveId: string) => {
    const updated = archives.filter(a => a.id !== archiveId);
    setArchivesState(updated);
    storage.saveArchives(updated);
    if (selectedArchiveId === archiveId) {
      setSelectedArchiveId(null);
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
        settings,
        updateSettings,
        updateDailyOperatingHours,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        classrooms,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        scheduleSlots: activeSlots,
        updateSlot,
        deleteSlot,
        generateSchedule,
        jumbleRooms,
        substitutions,
        assignSubstitute,
        removeSubstitute,
        bottlenecks,
        fixBottleneck,
        archives,
        selectedArchiveId,
        selectArchive,
        saveCurrentWeekToArchive,
        deleteArchive,
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
