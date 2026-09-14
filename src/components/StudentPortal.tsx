import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Smartphone, Search, QrCode, Clock, MapPin, UserCheck } from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { scheduleSlots, subjects, teachers, classrooms } = useSchedule();
  const [queryCode, setQueryCode] = useState('BSCS 1-A');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const filteredSlots = scheduleSlots.filter(
    s =>
      s.sectionCode.toLowerCase().includes(queryCode.toLowerCase().trim()) &&
      s.day === selectedDay
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          Mobile Read-Only Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white">Student & Parent Portal</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Look up daily class schedules, room numbers, and teacher assignments instantly via section code or QR code.
        </p>
      </div>

      {/* Search Bar & QR Code Card */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter Section Code (e.g. BSCS 1-A, BSIT 1-B)..."
              value={queryCode}
              onChange={e => setQueryCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 shrink-0">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <span className="text-xs text-slate-300 font-mono">Scan Quick QR</span>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDay === d
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Mobile Device Frame */}
      <div className="max-w-md mx-auto bg-slate-900 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-indigo-600 p-4 text-white text-center">
          <h3 className="text-base font-bold">{queryCode || 'Section Lookup'}</h3>
          <p className="text-xs text-indigo-200">{selectedDay} Timetable</p>
        </div>

        <div className="p-4 space-y-3 min-h-[350px]">
          {filteredSlots.map(slot => {
            const subject = subjects.find(s => s.id === slot.subjectId);
            const teacher = teachers.find(
              t => t.id === (slot.substituteTeacherId || slot.teacherId)
            );
            const room = classrooms.find(r => r.id === slot.classroomId);

            return (
              <div
                key={slot.id}
                className="bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: subject?.color || '#3B82F6' }}
                  >
                    {subject?.code}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{subject?.name}</h4>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-700/50">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    {teacher?.name}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {room?.roomNumber}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredSlots.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-xs italic">
              No classes scheduled for section {queryCode} on {selectedDay}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
