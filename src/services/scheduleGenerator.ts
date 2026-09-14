import type { SchoolSettings, Subject, Teacher, Classroom, ScheduleSlot, DayOfWeek } from '../types';

export function generateTimeSlots(settings: SchoolSettings): { startTime: string; endTime: string; periodIndex: number }[] {
  const slots: { startTime: string; endTime: string; periodIndex: number }[] = [];
  const [startHour, startMin] = settings.operatingStartTime.split(':').map(Number);
  const [endHour, endMin] = settings.operatingEndTime.split(':').map(Number);

  const totalStartMins = startHour * 60 + startMin;
  const totalEndMins = endHour * 60 + endMin;
  const duration = settings.periodDurationMinutes;

  let currentMins = totalStartMins;
  let index = 1;

  while (currentMins + duration <= totalEndMins) {
    const sH = String(Math.floor(currentMins / 60)).padStart(2, '0');
    const sM = String(currentMins % 60).padStart(2, '0');
    const eH = String(Math.floor((currentMins + duration) / 60)).padStart(2, '0');
    const eM = String((currentMins + duration) % 60).padStart(2, '0');

    // Skip lunch break if configured
    const slotStartStr = `${sH}:${sM}`;
    if (settings.lunchBreakStart && settings.lunchBreakEnd) {
      if (slotStartStr >= settings.lunchBreakStart && slotStartStr < settings.lunchBreakEnd) {
        currentMins += duration;
        continue;
      }
    }

    slots.push({
      startTime: slotStartStr,
      endTime: `${eH}:${eM}`,
      periodIndex: index++
    });

    currentMins += duration;
  }

  return slots;
}

export function generateMasterSchedule(
  settings: SchoolSettings,
  subjects: Subject[],
  teachers: Teacher[],
  classrooms: Classroom[]
): ScheduleSlot[] {
  const generatedSlots: ScheduleSlot[] = [];
  const timePeriods = generateTimeSlots(settings);
  const days: DayOfWeek[] = settings.days;

  // Track assignments: teacherId -> Set of "Day_Time"
  const teacherBookings = new Map<string, Set<string>>();
  teachers.forEach(t => teacherBookings.set(t.id, new Set()));

  // Track room assignments: classroomId -> Set of "Day_Time"
  const roomBookings = new Map<string, Set<string>>();
  classrooms.forEach(r => roomBookings.set(r.id, new Set()));

  // Group subjects by grade level
  const subjectsByGrade = new Map<string, Subject[]>();
  subjects.forEach(sub => {
    if (!subjectsByGrade.has(sub.gradeLevel)) {
      subjectsByGrade.set(sub.gradeLevel, []);
    }
    subjectsByGrade.get(sub.gradeLevel)!.push(sub);
  });

  const gradeLevels = Array.from(subjectsByGrade.keys());

  gradeLevels.forEach((grade, gradeIdx) => {
    const sectionCode = `${grade.replace('Grade ', '')}-A`;
    const gradeSubjects = subjectsByGrade.get(grade) || [];

    // Assign classrooms for this grade level
    const room = classrooms[gradeIdx % classrooms.length] || classrooms[0];
    if (!room) return;

    // Create a pool of subject sessions to schedule based on weekly frequency
    const sessionPool: Subject[] = [];
    gradeSubjects.forEach(sub => {
      for (let i = 0; i < sub.weeklyFrequency; i++) {
        sessionPool.push(sub);
      }
    });

    let sessionIdx = 0;

    for (const day of days) {
      for (const period of timePeriods) {
        if (sessionIdx >= sessionPool.length) break;

        const timeKey = `${day}_${period.startTime}`;

        // Find an unassigned subject session
        const subject = sessionPool[sessionIdx];
        if (!subject) continue;

        // Find qualified teacher who is available
        const qualifiedTeachers = teachers.filter(t =>
          t.qualifiedSubjectIds.includes(subject.id) &&
          !t.blockedDays.includes(day) &&
          (t.availableTimeSlots.length === 0 || t.availableTimeSlots.includes(period.startTime))
        );

        // Pick teacher with available slot
        const availableTeacher = qualifiedTeachers.find(t => {
          const bookings = teacherBookings.get(t.id);
          return bookings && !bookings.has(timeKey);
        });

        // Check room availability
        const isRoomFree = !roomBookings.get(room.id)?.has(timeKey);

        if (availableTeacher && isRoomFree) {
          // Double check teacher load
          const currentLoad = Array.from(teacherBookings.get(availableTeacher.id) || []).length;
          if (currentLoad < availableTeacher.maxWeeklyHours) {
            teacherBookings.get(availableTeacher.id)!.add(timeKey);
            roomBookings.get(room.id)!.add(timeKey);

            generatedSlots.push({
              id: `slot-${day}-${period.periodIndex}-${room.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              day,
              startTime: period.startTime,
              endTime: period.endTime,
              periodIndex: period.periodIndex,
              subjectId: subject.id,
              teacherId: availableTeacher.id,
              classroomId: room.id,
              gradeLevel: grade,
              sectionCode
            });

            sessionIdx++;
          }
        }
      }
    }
  });

  return generatedSlots;
}
