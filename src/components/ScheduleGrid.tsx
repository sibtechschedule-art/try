import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { generateDayTimeSlots } from '../services/scheduleGenerator';
import type { ScheduleSlot, DayOfWeek } from '../types';
import {
  Printer,
  Edit3,
  Shuffle,
  Archive,
  Calendar,
  UserCheck,
  Trash2,
  X,
  Check,
  Lock,
  History
} from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const ScheduleGrid: React.FC = () => {
  const {
    scheduleSlots,
    subjects,
    teachers,
    classrooms,
    settings,
    updateSlot,
    deleteSlot,
    jumbleRooms,
    archives,
    selectedArchiveId,
    selectArchive,
    saveCurrentWeekToArchive,
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [newArchiveLabel, setNewArchiveLabel] = useState('');

  // Editing form state
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editClassroomId, setEditClassroomId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  const openEditModal = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setEditSubjectId(slot.subjectId);
    setEditTeacherId(slot.substituteTeacherId || slot.teacherId);
    setEditClassroomId(slot.classroomId);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
  };

  const saveSlotEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    updateSlot(editingSlot.id, {
      subjectId: editSubjectId,
      teacherId: editTeacherId,
      substituteTeacherId: undefined,
      isSubstituted: false,
      classroomId: editClassroomId,
      startTime: editStartTime,
      endTime: editEndTime,
    });

    setEditingSlot(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArchiveLabel.trim()) return;
    saveCurrentWeekToArchive(newArchiveLabel);
    setNewArchiveLabel('');
    setArchiveModalOpen(false);
  };

  const dayTimeSlots = generateDayTimeSlots(selectedDay, settings);

  return (
    <div className="space-y-6">
      {/* Printable Header - hidden on screen, visible on print */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">Schedulify - Master College Timetable</h1>
        <p className="text-sm text-gray-600">Generated Schedule Grid for {selectedDay}</p>
      </div>

      {/* Screen Toolbar */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-400" />
            Master Schedule Matrix Grid
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Interactive timetable matrix with room auto-locking, emergency room jumbling, and historical week archives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Historical Week Selector */}
          <div className="relative flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
            <History className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedArchiveId || ''}
              onChange={e => selectArchive(e.target.value || null)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">Current Master Schedule</option>
              {archives.map(arch => (
                <option key={arch.id} value={arch.id} className="bg-slate-900 text-white">
                  Archive: {arch.weekLabel} ({arch.createdAt})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setArchiveModalOpen(true)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Save Current Schedule to Historical Archive"
          >
            <Archive className="w-4 h-4 text-slate-400" />
            Archive Week
          </button>

          <button
            onClick={jumbleRooms}
            className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Emergency Jumble: Reassign room locks to vacant rooms"
          >
            <Shuffle className="w-4 h-4 text-amber-400" />
            Emergency Jumble Rooms
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="print:hidden flex items-center gap-2 overflow-x-auto pb-1">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedDay === day
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Grid Matrix */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm print:bg-white print:border-none print:shadow-none print:p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm print:text-black">
            <thead>
              <tr className="border-b border-slate-700/80 print:border-black">
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-36 print:text-black">
                  Time Slot
                </th>
                {classrooms.map(room => (
                  <th key={room.id} className="p-3 text-xs font-semibold text-slate-300 print:text-black min-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400 print:hidden" />
                      <span>{room.roomNumber}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/50 print:divide-gray-300">
              {dayTimeSlots.map(timeSlot => (
                <tr key={`${timeSlot.startTime}-${timeSlot.endTime}`} className="hover:bg-slate-700/20 print:hover:bg-transparent">
                  <td className="p-3 font-mono text-xs text-slate-400 print:text-black font-semibold whitespace-nowrap">
                    {timeSlot.startTime} - {timeSlot.endTime}
                  </td>

                  {classrooms.map(room => {
                    const matchedSlot = scheduleSlots.find(
                      s =>
                        s.day === selectedDay &&
                        s.classroomId === room.id &&
                        s.startTime === timeSlot.startTime
                    );

                    if (!matchedSlot) {
                      return (
                        <td key={room.id} className="p-3 text-xs text-slate-600 italic print:text-gray-400">
                          <span className="print:hidden">— Available —</span>
                        </td>
                      );
                    }

                    const subject = subjects.find(sub => sub.id === matchedSlot.subjectId);
                    const activeTeacherId = matchedSlot.substituteTeacherId || matchedSlot.teacherId;
                    const teacher = teachers.find(t => t.id === activeTeacherId);

                    return (
                      <td key={room.id} className="p-2">
                        <div
                          onClick={() => openEditModal(matchedSlot)}
                          className="group relative p-3 rounded-xl border transition cursor-pointer shadow-md print:border-gray-400 print:bg-gray-100"
                          style={{
                            backgroundColor: subject ? `${subject.color}15` : '#1E293B',
                            borderColor: subject ? `${subject.color}60` : '#334155',
                          }}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white print:text-black"
                              style={{ backgroundColor: subject?.color || '#3B82F6' }}
                            >
                              {subject?.code || 'SUB'}
                            </span>

                            <div className="flex items-center gap-1">
                              {matchedSlot.isSubstituted && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-black print:hidden">
                                  SUB
                                </span>
                              )}
                              <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition print:hidden" />
                            </div>
                          </div>

                          <h4 className="text-xs font-semibold text-white print:text-black line-clamp-1 mb-1">
                            {subject?.name || 'Class Session'}
                          </h4>

                          <div className="flex items-center justify-between text-[11px] text-slate-300 print:text-gray-800">
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-indigo-400 print:hidden" />
                              {teacher?.name || 'Unassigned'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 print:text-gray-600">
                              {matchedSlot.sectionCode}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Slot Edit Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Edit Timetable Block
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveSlotEdits} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={editSubjectId}
                  onChange={e => setEditSubjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Instructor</label>
                <select
                  value={editTeacherId}
                  onChange={e => setEditTeacherId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Classroom</label>
                <select
                  value={editClassroomId}
                  onChange={e => setEditClassroomId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.roomNumber}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={e => setEditStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={e => setEditEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    deleteSlot(editingSlot.id);
                    setEditingSlot(null);
                  }}
                  className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete Block
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Check className="w-4 h-4" /> Save Block
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {archiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-indigo-400" /> Save Historical Archive
            </h3>

            <form onSubmit={handleSaveArchive} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Archive Label / Week Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Week 1 (Fall Semester)"
                  value={newArchiveLabel}
                  onChange={e => setNewArchiveLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setArchiveModalOpen(false)}
                  className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  Save Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
