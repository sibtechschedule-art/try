export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type CollegeYearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export interface DayTimeRange {
  enabled: boolean;
  startTime: string; // e.g. "07:00"
  endTime: string;   // e.g. "18:00"
}

export interface SchoolSettings {
  dailyOperatingHours: Record<DayOfWeek, DayTimeRange>;
  periodDurationMinutes: number; // e.g. 60
  days: DayOfWeek[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  yearLevel: CollegeYearLevel;
  weeklyFrequency: number; // e.g. 3 sessions per week
  sessionDurationHours: number; // e.g. 1.0, 1.5, 2.0 hours per session
  color: string;
}

export interface Teacher {
  id: string;
  name: string;
  qualifiedSubjectIds: string[];
  maxWeeklyHours: number; // e.g. 20 hours/week max limit
  dailyAvailability: Record<DayOfWeek, DayTimeRange>;
  avatarUrl?: string;
}

export interface Classroom {
  id: string;
  roomNumber: string; // Streamlined: Room Number / ID only
}

export interface ScheduleSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  subjectId: string;
  teacherId: string;
  substituteTeacherId?: string;
  classroomId: string; // Locked room ID while session active
  yearLevel: CollegeYearLevel;
  sectionCode: string; // e.g. "BSCS 1-A"
  isSubstituted?: boolean;
  originalTeacherId?: string;
  hasConflict?: boolean;
  conflictReason?: string;
  isRoomLocked?: boolean;
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
  type: 'teacher_double_booked' | 'room_double_booked' | 'heavy_workload' | 'unavailable_teacher';
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
  yearLevel: CollegeYearLevel;
  slots: ScheduleSlot[];
}

export interface ArchivedSchedule {
  id: string;
  name: string;
  weekLabel: string; // e.g. "Week 1 (Aug 14 - Aug 18)"
  createdAt: string;
  slots: ScheduleSlot[];
}
