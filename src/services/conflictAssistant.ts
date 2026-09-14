import type { ScheduleSlot, ConflictBottleneck, Teacher, Classroom, Subject } from '../types';

export function scanScheduleBottlenecks(
  slots: ScheduleSlot[],
  teachers: Teacher[],
  classrooms: Classroom[],
  _subjects: Subject[]
): ConflictBottleneck[] {
  const bottlenecks: ConflictBottleneck[] = [];

  // 1. Detect Double Bookings (Teacher or Room booked twice at same day + startTime)
  const teacherTimeMap = new Map<string, ScheduleSlot[]>();
  const roomTimeMap = new Map<string, ScheduleSlot[]>();

  slots.forEach(slot => {
    const activeTeacher = slot.substituteTeacherId || slot.teacherId;
    const tKey = `${activeTeacher}_${slot.day}_${slot.startTime}`;
    const rKey = `${slot.classroomId}_${slot.day}_${slot.startTime}`;

    if (!teacherTimeMap.has(tKey)) teacherTimeMap.set(tKey, []);
    teacherTimeMap.get(tKey)!.push(slot);

    if (!roomTimeMap.has(rKey)) roomTimeMap.set(rKey, []);
    roomTimeMap.get(rKey)!.push(slot);
  });

  teacherTimeMap.forEach((matchedSlots, key) => {
    if (matchedSlots.length > 1) {
      const teacherId = key.split('_')[0];
      const teacher = teachers.find(t => t.id === teacherId);
      const teacherName = teacher ? teacher.name : 'Teacher';
      bottlenecks.push({
        id: `btn-t-double-${key}`,
        type: 'teacher_double_booked',
        severity: 'high',
        title: `Double-Booked Teacher: ${teacherName}`,
        description: `${teacherName} is assigned to ${matchedSlots.length} classrooms simultaneously on ${matchedSlots[0].day} at ${matchedSlots[0].startTime}.`,
        affectedSlotIds: matchedSlots.map(s => s.id),
        suggestedFix: {
          actionType: 'reassign_teacher',
          description: `Reassign one of the slots to an available substitute or free teacher.`,
        }
      });
    }
  });

  roomTimeMap.forEach((matchedSlots, key) => {
    if (matchedSlots.length > 1) {
      const roomId = key.split('_')[0];
      const room = classrooms.find(r => r.id === roomId);
      const roomName = room ? room.roomNumber : 'Classroom';
      bottlenecks.push({
        id: `btn-r-double-${key}`,
        type: 'room_double_booked',
        severity: 'high',
        title: `Double-Booked Classroom: ${roomName}`,
        description: `${roomName} is reserved by multiple sections on ${matchedSlots[0].day} at ${matchedSlots[0].startTime}.`,
        affectedSlotIds: matchedSlots.map(s => s.id),
        suggestedFix: {
          actionType: 'change_room',
          description: `Move one class to a different vacant classroom.`,
        }
      });
    }
  });

  // 2. Detect Heavy Workload (Teachers teaching > 4 sessions in a single day)
  teachers.forEach(teacher => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    days.forEach(day => {
      const teacherDaySlots = slots
        .filter(s => (s.substituteTeacherId || s.teacherId) === teacher.id && s.day === day);

      if (teacherDaySlots.length >= 4) {
        bottlenecks.push({
          id: `btn-heavy-${teacher.id}-${day}`,
          type: 'heavy_workload',
          severity: 'medium',
          title: `Heavy Daily Workload: ${teacher.name}`,
          description: `${teacher.name} has ${teacherDaySlots.length} sessions scheduled on ${day}.`,
          affectedSlotIds: teacherDaySlots.map(s => s.id),
          suggestedFix: {
            actionType: 'reassign_teacher',
            description: `Assign a substitute teacher for one session on ${day} to grant a rest window.`
          }
        });
      }
    });
  });

  return bottlenecks;
}

export function autoResolveBottleneck(
  bottleneck: ConflictBottleneck,
  slots: ScheduleSlot[],
  teachers: Teacher[],
  classrooms: Classroom[]
): ScheduleSlot[] {
  const updatedSlots = [...slots];
  const affected = updatedSlots.filter(s => bottleneck.affectedSlotIds.includes(s.id));

  if (affected.length === 0) return slots;

  const targetSlot = affected[affected.length - 1]; // target slot to modify
  const slotIndex = updatedSlots.findIndex(s => s.id === targetSlot.id);

  if (slotIndex === -1) return slots;

  if (bottleneck.type === 'teacher_double_booked' || bottleneck.type === 'heavy_workload' || bottleneck.type === 'unavailable_teacher') {
    // Find free teacher qualified for target slot's subject
    const currentTeacherId = targetSlot.substituteTeacherId || targetSlot.teacherId;
    const otherTeachers = teachers.filter(t => t.id !== currentTeacherId);

    const availableSubstitute = otherTeachers.find(t => {
      const isBooked = updatedSlots.some(s =>
        (s.substituteTeacherId || s.teacherId) === t.id &&
        s.day === targetSlot.day &&
        s.startTime === targetSlot.startTime
      );
      return !isBooked;
    });

    if (availableSubstitute) {
      updatedSlots[slotIndex] = {
        ...targetSlot,
        substituteTeacherId: availableSubstitute.id,
        isSubstituted: true
      };
    }
  } else if (bottleneck.type === 'room_double_booked') {
    // Find free classroom
    const freeRoom = classrooms.find(r => {
      const isRoomBooked = updatedSlots.some(s =>
        s.classroomId === r.id &&
        s.day === targetSlot.day &&
        s.startTime === targetSlot.startTime
      );
      return !isRoomBooked && r.id !== targetSlot.classroomId;
    });

    if (freeRoom) {
      updatedSlots[slotIndex] = {
        ...targetSlot,
        classroomId: freeRoom.id
      };
    }
  }

  return updatedSlots;
}
