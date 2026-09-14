import type { SchoolSettings, Subject, Teacher, Classroom, ScheduleSlot, DayOfWeek, CollegeYearLevel } from '../types';

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Generates time slots per day based on school daily operating hours
export function generateDayTimeSlots(day: DayOfWeek, settings: SchoolSettings): { startTime: string; endTime: string }[] {
  const dayConfig = settings.dailyOperatingHours[day];
  if (!dayConfig || !dayConfig.enabled) return [];

  const startMins = timeToMinutes(dayConfig.startTime);
  const endMins = timeToMinutes(dayConfig.endTime);
  const periodMinutes = settings.periodDurationMinutes || 60;

  const slots: { startTime: string; endTime: string }[] = [];
  let current = startMins;

  while (current + periodMinutes <= endMins) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + periodMinutes),
    });
    current += periodMinutes;
  }

  return slots;
}

// Checks if a teacher is available during a given day and time window
export function isTeacherAvailable(
  teacher: Teacher,
  day: DayOfWeek,
  startTime: string,
  endTime: string
): boolean {
  const avail = teacher.dailyAvailability[day];
  if (!avail || !avail.enabled) return false;

  const reqStart = timeToMinutes(startTime);
  const reqEnd = timeToMinutes(endTime);
  const teacherStart = timeToMinutes(avail.startTime);
  const teacherEnd = timeToMinutes(avail.endTime);

  return reqStart >= teacherStart && reqEnd <= teacherEnd;
}

// Checks if a room is locked / assigned to another session during the time window
export function isRoomLockedAtTime(
  classroomId: string,
  day: DayOfWeek,
  startTime: string,
  endTime: string,
  existingSlots: ScheduleSlot[],
  ignoreSlotId?: string
): boolean {
  const reqStart = timeToMinutes(startTime);
  const reqEnd = timeToMinutes(endTime);

  return existingSlots.some(slot => {
    if (ignoreSlotId && slot.id === ignoreSlotId) return false;
    if (slot.classroomId !== classroomId || slot.day !== day) return false;

    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    // Overlap check
    return reqStart < slotEnd && reqEnd > slotStart;
  });
}

// Checks if a teacher is double booked during the time window
export function isTeacherBookedAtTime(
  teacherId: string,
  day: DayOfWeek,
  startTime: string,
  endTime: string,
  existingSlots: ScheduleSlot[],
  ignoreSlotId?: string
): boolean {
  const reqStart = timeToMinutes(startTime);
  const reqEnd = timeToMinutes(endTime);

  return existingSlots.some(slot => {
    if (ignoreSlotId && slot.id === ignoreSlotId) return false;
    const activeTeacherId = slot.substituteTeacherId || slot.teacherId;
    if (activeTeacherId !== teacherId || slot.day !== day) return false;

    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    return reqStart < slotEnd && reqEnd > slotStart;
  });
}

// Master Automated Schedule Generator Engine
export function generateMasterSchedule(
  subjects: Subject[],
  teachers: Teacher[],
  classrooms: Classroom[],
  settings: SchoolSettings
): ScheduleSlot[] {
  const generatedSlots: ScheduleSlot[] = [];
  const teacherWeeklyHoursMap: Record<string, number> = {};
  teachers.forEach(t => { teacherWeeklyHoursMap[t.id] = 0; });

  const sectionMap: Record<CollegeYearLevel, string[]> = {
    '1st Year': ['BSCS 1-A', 'BSIT 1-B'],
    '2nd Year': ['BSCS 2-A'],
    '3rd Year': ['BSCS 3-A'],
    '4th Year': ['BSCS 4-A'],
  };

  if (classrooms.length === 0 || teachers.length === 0 || subjects.length === 0) {
    return generatedSlots;
  }

  // Iterate over each subject and allocate required weekly frequency
  for (const subject of subjects) {
    const qualifiedTeachers = teachers.filter(t => t.qualifiedSubjectIds.includes(subject.id));
    if (qualifiedTeachers.length === 0) continue;

    const sections = sectionMap[subject.yearLevel] || ['SEC-1'];
    const sessionsNeeded = subject.weeklyFrequency;
    const durationMins = (subject.sessionDurationHours || 1) * 60;

    for (const sectionCode of sections) {
      let allocatedCount = 0;

      for (const day of settings.days) {
        if (allocatedCount >= sessionsNeeded) break;

        const dayConfig = settings.dailyOperatingHours[day];
        if (!dayConfig || !dayConfig.enabled) continue;

        const dayStart = timeToMinutes(dayConfig.startTime);
        const dayEnd = timeToMinutes(dayConfig.endTime);

        // Try candidate time slots on this day
        let currentStart = dayStart;
        while (currentStart + durationMins <= dayEnd && allocatedCount < sessionsNeeded) {
          const slotStartTime = minutesToTime(currentStart);
          const slotEndTime = minutesToTime(currentStart + durationMins);

          // Find available qualified teacher
          let assignedTeacher: Teacher | null = null;
          for (const teacher of qualifiedTeachers) {
            const currentHours = teacherWeeklyHoursMap[teacher.id] || 0;
            if (currentHours + (durationMins / 60) > teacher.maxWeeklyHours) continue;

            if (isTeacherAvailable(teacher, day, slotStartTime, slotEndTime) &&
                !isTeacherBookedAtTime(teacher.id, day, slotStartTime, slotEndTime, generatedSlots)) {
              assignedTeacher = teacher;
              break;
            }
          }

          if (assignedTeacher) {
            // Find available classroom
            let assignedRoom: Classroom | null = null;
            for (const room of classrooms) {
              if (!isRoomLockedAtTime(room.id, day, slotStartTime, slotEndTime, generatedSlots)) {
                assignedRoom = room;
                break;
              }
            }

            if (assignedRoom) {
              const newSlot: ScheduleSlot = {
                id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                day,
                startTime: slotStartTime,
                endTime: slotEndTime,
                subjectId: subject.id,
                teacherId: assignedTeacher.id,
                classroomId: assignedRoom.id,
                yearLevel: subject.yearLevel,
                sectionCode,
                isRoomLocked: true,
              };

              generatedSlots.push(newSlot);
              teacherWeeklyHoursMap[assignedTeacher.id] += (durationMins / 60);
              allocatedCount++;

              // Advance start time past this session
              currentStart += durationMins;
              continue;
            }
          }

          currentStart += settings.periodDurationMinutes || 60;
        }
      }
    }
  }

  return generatedSlots;
}

// Emergency Room Jumble / Swap Engine
export function jumbleRoomAssignments(
  slots: ScheduleSlot[],
  classrooms: Classroom[]
): ScheduleSlot[] {
  if (classrooms.length < 2) return slots;

  const updatedSlots = [...slots];
  for (let i = 0; i < updatedSlots.length; i++) {
    const slot = updatedSlots[i];
    // Find a different room that is free during slot.day and slot.startTime -> slot.endTime
    const alternativeRoom = classrooms.find(r =>
      r.id !== slot.classroomId &&
      !isRoomLockedAtTime(r.id, slot.day, slot.startTime, slot.endTime, updatedSlots, slot.id)
    );

    if (alternativeRoom) {
      updatedSlots[i] = {
        ...slot,
        classroomId: alternativeRoom.id,
      };
    }
  }

  return updatedSlots;
}
