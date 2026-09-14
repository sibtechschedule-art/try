export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface SchoolSettings {
  operatingStartTime: string; // e.g. "07:00"
  operatingEndTime: string;   // e.g. "17:00"
  periodDurationMinutes: number; // e.g. 60
  days: DayOfWeek[];
  lunchBreakStart?: string; // e.g. "12:00"
  lunchBreakEnd?: string;   // e.g. "13:00"
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  gradeLevel: string; // e.g. "Grade 9", "Grade 10"
  weeklyFrequency: number; // number of periods required per week
  color: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  qualifiedSubjectIds: string[];
  maxWeeklyHours: number; // e.g. 20 hours/periods per week limit
  buildingLocation: string; // e.g. "Building A"
  blockedDays: DayOfWeek[];
  availableTimeSlots: string[]; // e.g. ["08:00-09:00", "09:00-10:00", ...]
  avatarUrl?: string;
}

export interface Classroom {
  id: string;
  roomNumber: string;
  name: string;
  capacity: number;
  building: string; // e.g. "Building A", "Building B"
  availableFrom: string; // "07:00"
  availableTo: string;   // "17:00"
}

export interface ScheduleSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  periodIndex: number;
  subjectId: string;
  teacherId: string;
  substituteTeacherId?: string;
  classroomId: string;
  gradeLevel: string; // "Grade 9"
  sectionCode: string; // "9-A"
  isSubstituted?: boolean;
  originalTeacherId?: string;
  hasConflict?: boolean;
  conflictReason?: string;
}

export interface SubstitutionRecord {
  id: string;
  slotId: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  date: string;
  reason: string;
  status: 'active' | 'resolved';
}

export interface ConflictBottleneck {
  id: string;
  type: 'teacher_double_booked' | 'room_double_booked' | 'heavy_workload' | 'distant_building' | 'unavailable_teacher';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedSlotIds: string[];
  suggestedFix?: {
    actionType: 'reassign_teacher' | 'move_slot' | 'change_room';
    description: string;
    newTeacherId?: string;
    newClassroomId?: string;
    newDay?: DayOfWeek;
    newStartTime?: string;
    newEndTime?: string;
  };
}

export interface StudentViewData {
  sectionCode: string;
  gradeLevel: string;
  slots: ScheduleSlot[];
}
