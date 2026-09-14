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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5 text-blue-900" />
          Mobile Read-Only Portal
        </div>
        <h1 className="text-3xl font-black text-blue-950">SIBTECH Student & Parent Portal</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Look up daily class schedules, room numbers, and teacher assignments instantly via section code or QR code.
        </p>
      </div>

      {/* Search Bar & QR Code Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter Section Code (e.g. BSCS 1-A, BSIT 1-B)..."
              value={queryCode}
              onChange={e => setQueryCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 shrink-0">
            <QrCode className="w-5 h-5 text-blue-900" />
            <span className="text-xs text-slate-700 font-mono font-semibold">Scan Quick QR</span>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedDay === d
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Mobile Device Frame */}
      <div className="max-w-md mx-auto bg-slate-900 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-blue-900 p-4 text-white text-center">
          <h3 className="text-base font-extrabold text-amber-400">{queryCode || 'Section Lookup'}</h3>
          <p className="text-xs text-blue-200">{selectedDay} SIBTECH Timetable</p>
        </div>

        <div className="p-4 space-y-3 min-h-[350px] bg-slate-100">
          {filteredSlots.map(slot => {
            const subject = subjects.find(s => s.id === slot.subjectId);
            const teacher = teachers.find(
              t => t.id === (slot.substituteTeacherId || slot.teacherId)
            );
            const room = classrooms.find(r => r.id === slot.classroomId);

            return (
              <div
                key={slot.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: subject?.color || '#1E3A8A' }}
                  >
                    {subject?.code}
                  </span>
                  <span className="text-xs text-slate-600 font-mono font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{subject?.name}</h4>

                <div className="flex items-center justify-between text-xs text-slate-700 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-blue-900" />
                    {teacher?.name}
                  </span>
                  <span className="flex items-center gap-1 text-blue-900 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {room?.roomNumber}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredSlots.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs italic">
              No classes scheduled for section {queryCode} on {selectedDay}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
