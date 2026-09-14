import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { DayOfWeek, DayTimeRange } from '../types';
import { Users, Plus, Edit2, Trash2, Clock, BookOpen, Check, X, ShieldAlert } from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TeachersModule: React.FC = () => {
  const { teachers, subjects, scheduleSlots, addTeacher, updateTeacher, deleteTeacher } = useSchedule();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [qualifiedSubjectIds, setQualifiedSubjectIds] = useState<string[]>([]);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(18);
  const [dailyAvailability, setDailyAvailability] = useState<Record<DayOfWeek, DayTimeRange>>({
    Monday: { enabled: true, startTime: '07:00', endTime: '17:00' },
    Tuesday: { enabled: true, startTime: '07:00', endTime: '17:00' },
    Wednesday: { enabled: true, startTime: '07:00', endTime: '17:00' },
    Thursday: { enabled: true, startTime: '07:00', endTime: '17:00' },
    Friday: { enabled: true, startTime: '07:00', endTime: '17:00' },
  });

  const resetForm = () => {
    setName('');
    setQualifiedSubjectIds([]);
    setMaxWeeklyHours(18);
    setDailyAvailability({
      Monday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Tuesday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Wednesday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Thursday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Friday: { enabled: true, startTime: '07:00', endTime: '17:00' },
    });
    setEditingId(null);
  };

  const handleEdit = (teacher: typeof teachers[0]) => {
    setEditingId(teacher.id);
    setName(teacher.name);
    setQualifiedSubjectIds(teacher.qualifiedSubjectIds);
    setMaxWeeklyHours(teacher.maxWeeklyHours);
    setDailyAvailability(teacher.dailyAvailability || {
      Monday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Tuesday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Wednesday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Thursday: { enabled: true, startTime: '07:00', endTime: '17:00' },
      Friday: { enabled: true, startTime: '07:00', endTime: '17:00' },
    });
  };

  const toggleSubject = (subId: string) => {
    setQualifiedSubjectIds(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const updateDayAvailability = (day: DayOfWeek, field: keyof DayTimeRange, value: any) => {
    setDailyAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateTeacher(editingId, {
        name,
        qualifiedSubjectIds,
        maxWeeklyHours: Number(maxWeeklyHours),
        dailyAvailability,
      });
    } else {
      addTeacher({
        name,
        qualifiedSubjectIds,
        maxWeeklyHours: Number(maxWeeklyHours),
        dailyAvailability,
      });
    }
    resetForm();
  };

  // Calculate actual assigned hours per teacher
  const getTeacherAssignedHours = (teacherId: string) => {
    const teacherSlots = scheduleSlots.filter(
      s => (s.substituteTeacherId || s.teacherId) === teacherId
    );

    let totalMinutes = 0;
    teacherSlots.forEach(slot => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
    });

    return Math.round((totalMinutes / 60) * 10) / 10;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-400" />
          Faculty & Teachers Module
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage faculty profiles, qualified subjects, maximum load limits, and flexible day-specific availability windows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 backdrop-blur-sm shadow-xl h-fit">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {editingId ? <Edit2 className="w-5 h-5 text-indigo-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
            {editingId ? 'Edit Faculty Member' : 'Add New Faculty Member'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Teacher Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Sarah Jenkins"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Max Weekly Hours Limit</label>
              <input
                type="number"
                min="1"
                max="40"
                required
                value={maxWeeklyHours}
                onChange={e => setMaxWeeklyHours(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Qualified Subjects Checklist */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Qualified Subjects</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto bg-slate-900/60 border border-slate-700/80 rounded-lg p-2">
                {subjects.map(sub => {
                  const isChecked = qualifiedSubjectIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer text-xs transition ${
                        isChecked ? 'bg-indigo-950/80 border border-indigo-700 text-white' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubject(sub.id)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{sub.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{sub.code}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Flexible Daily Availability Configurator */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Flexible Daily Hours & Availability
              </label>

              <div className="space-y-2 bg-slate-900/60 border border-slate-700/80 rounded-lg p-3">
                {DAYS_OF_WEEK.map(day => {
                  const dayAvail = dailyAvailability[day] || { enabled: true, startTime: '07:00', endTime: '17:00' };
                  return (
                    <div key={day} className="flex items-center justify-between gap-2 text-xs">
                      <label className="flex items-center gap-2 min-w-[90px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayAvail.enabled}
                          onChange={e => updateDayAvailability(day, 'enabled', e.target.checked)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={dayAvail.enabled ? 'text-slate-200 font-medium' : 'text-slate-500 line-through'}>
                          {day}
                        </span>
                      </label>

                      {dayAvail.enabled ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={dayAvail.startTime}
                            onChange={e => updateDayAvailability(day, 'startTime', e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-[11px]"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="time"
                            value={dayAvail.endTime}
                            onChange={e => updateDayAvailability(day, 'endTime', e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-[11px]"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Save Faculty Member' : 'Add Faculty Member'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 px-3 rounded-lg text-sm flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Faculty List & Workload Balance Indicator */}
        <div className="lg:col-span-7 space-y-4">
          {teachers.map(t => {
            const assignedHours = getTeacherAssignedHours(t.id);
            const loadPercentage = Math.min(Math.round((assignedHours / t.maxWeeklyHours) * 100), 100);
            const isOverloaded = assignedHours > t.maxWeeklyHours;

            return (
              <div
                key={t.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 hover:border-slate-600 transition shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/40"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-white">{t.name}</h3>
                      <p className="text-xs text-slate-400">
                        Max Capacity: <strong className="text-slate-200">{t.maxWeeklyHours} hrs/week</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition"
                      title="Edit Teacher"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTeacher(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Workload Balance Indicator Bar */}
                <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/50 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      {isOverloaded && <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                      Workload Balance Status
                    </span>
                    <span className={`font-mono font-bold ${isOverloaded ? 'text-amber-400' : 'text-slate-300'}`}>
                      {assignedHours} / {t.maxWeeklyHours} hrs ({loadPercentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isOverloaded
                          ? 'bg-amber-500'
                          : loadPercentage > 85
                          ? 'bg-indigo-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Qualified Subjects Badges */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-indigo-400" /> Qualified Subjects
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.qualifiedSubjectIds.map(subId => {
                      const sub = subjects.find(s => s.id === subId);
                      if (!sub) return null;
                      return (
                        <span
                          key={sub.id}
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium text-white shadow-sm"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.code} - {sub.name}
                        </span>
                      );
                    })}
                    {t.qualifiedSubjectIds.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No subjects assigned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {teachers.length === 0 && (
            <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-400">
              No faculty members added yet. Add your first teacher using the form.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
