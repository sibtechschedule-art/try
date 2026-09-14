import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { isTeacherAvailable, isTeacherBookedAtTime } from '../services/scheduleGenerator';
import type { ScheduleSlot, DayOfWeek } from '../types';
import {
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  X
} from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const SubstitutionDrawer: React.FC = () => {
  const {
    scheduleSlots,
    teachers,
    subjects,
    classrooms,
    assignSubstitute,
    removeSubstitute,
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [draggedTeacherId, setDraggedTeacherId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const activeDaySlots = scheduleSlots.filter(s => s.day === selectedDay);

  // Qualified substitute pool
  const availableSubstitutes = teachers;

  const handleDragStart = (e: React.DragEvent, teacherId: string) => {
    e.dataTransfer.setData('text/plain', teacherId);
    setDraggedTeacherId(teacherId);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlotId(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlotId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: ScheduleSlot) => {
    e.preventDefault();
    const teacherId = e.dataTransfer.getData('text/plain') || draggedTeacherId;
    setDragOverSlotId(null);
    setDraggedTeacherId(null);

    if (!teacherId) return;

    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    // Check Smart Conflict Prevention Shield
    const isAvailable = isTeacherAvailable(teacher, targetSlot.day, targetSlot.startTime, targetSlot.endTime);
    const isBooked = isTeacherBookedAtTime(teacherId, targetSlot.day, targetSlot.startTime, targetSlot.endTime, scheduleSlots, targetSlot.id);

    if (isBooked) {
      setConflictWarning(
        `CONFLICT SHIELD ALERT: ${teacher.name} is already booked in another classroom at ${targetSlot.startTime} on ${targetSlot.day}!`
      );
      setTimeout(() => setConflictWarning(null), 5000);
      return;
    }

    if (!isAvailable) {
      setConflictWarning(
        `AVAILABILITY WARNING: ${teacher.name} has not enabled availability for ${targetSlot.day} ${targetSlot.startTime}-${targetSlot.endTime}.`
      );
      setTimeout(() => setConflictWarning(null), 5000);
    }

    assignSubstitute(targetSlot.id, teacherId, 'Emergency Substitute Assignment');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950 flex items-center gap-2">
          <UserCheck className="w-7 h-7 text-blue-900" />
          Emergency Substitute Pool & Drag-and-Drop
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Grab qualified substitute teachers from the pool and drop them onto active schedule slots with real-time conflict validation warnings.
        </p>
      </div>

      {conflictWarning && (
        <div className="bg-rose-100 border border-rose-400 rounded-xl p-4 flex items-center gap-3 text-rose-900 text-xs font-bold shadow-md animate-bounce">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{conflictWarning}</span>
        </div>
      )}

      {/* Day Selector */}
      <div className="flex items-center gap-2">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedDay === day
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Substitute Pool Sidebar */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-md h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Available Faculty Pool ({availableSubstitutes.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Drag Card</span>
          </div>

          <p className="text-xs text-slate-600">
            Click and drag any faculty card onto an active class slot on the right to assign them as a substitute.
          </p>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {availableSubstitutes.map(t => (
              <div
                key={t.id}
                draggable
                onDragStart={e => handleDragStart(e, t.id)}
                className="bg-slate-50 border border-slate-200 hover:border-blue-900/60 rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition shadow-sm group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition">{t.name}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> Max {t.maxWeeklyHours} hrs/week
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-blue-900 transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Schedule Slots Drop Zone */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-900" />
            Active Scheduled Class Slots for {selectedDay}
          </h3>

          <div className="space-y-3">
            {activeDaySlots.map(slot => {
              const subject = subjects.find(s => s.id === slot.subjectId);
              const room = classrooms.find(r => r.id === slot.classroomId);
              const originalTeacher = teachers.find(t => t.id === slot.teacherId);
              const activeTeacher = teachers.find(
                t => t.id === (slot.substituteTeacherId || slot.teacherId)
              );

              const isDragTarget = dragOverSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  onDragOver={e => handleDragOver(e, slot.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, slot)}
                  className={`p-4 rounded-xl border transition shadow-sm ${
                    isDragTarget
                      ? 'bg-blue-50 border-blue-900 border-2 scale-[1.01]'
                      : slot.isSubstituted
                      ? 'bg-amber-50 border-amber-400'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: subject?.color || '#1E3A8A' }}
                      >
                        {subject?.code || 'SUB'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {subject?.name}
                          <span className="text-xs text-slate-500 font-mono">({slot.sectionCode})</span>
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-3 mt-0.5">
                          <span>⏱ {slot.startTime} - {slot.endTime}</span>
                          <span>🚪 {room?.roomNumber}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-semibold">Assigned Instructor</span>
                        <span className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                          {slot.isSubstituted && (
                            <span className="text-[10px] text-amber-600 font-bold">[SUB]</span>
                          )}
                          {activeTeacher?.name}
                        </span>
                        {slot.isSubstituted && originalTeacher && (
                          <span className="text-[10px] text-slate-400 block line-through">
                            Orig: {originalTeacher.name}
                          </span>
                        )}
                      </div>

                      {slot.isSubstituted && (
                        <button
                          onClick={() => removeSubstitute(slot.id)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer"
                          title="Restore Original Teacher"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {activeDaySlots.length === 0 && (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
                No active class sessions scheduled for {selectedDay}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
