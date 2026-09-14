import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { CollegeYearLevel } from '../types';
import { BookOpen, Plus, Edit2, Trash2, Clock, Calendar, Check, X } from 'lucide-react';

const YEAR_LEVELS: CollegeYearLevel[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const SubjectsModule: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSchedule();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [yearLevel, setYearLevel] = useState<CollegeYearLevel>('1st Year');
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);
  const [sessionDurationHours, setSessionDurationHours] = useState(1);
  const [color, setColor] = useState('#3B82F6');

  const resetForm = () => {
    setName('');
    setCode('');
    setYearLevel('1st Year');
    setWeeklyFrequency(3);
    setSessionDurationHours(1);
    setColor('#3B82F6');
    setEditingId(null);
  };

  const handleEdit = (sub: typeof subjects[0]) => {
    setEditingId(sub.id);
    setName(sub.name);
    setCode(sub.code);
    setYearLevel(sub.yearLevel);
    setWeeklyFrequency(sub.weeklyFrequency);
    setSessionDurationHours(sub.sessionDurationHours || 1);
    setColor(sub.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingId) {
      updateSubject(editingId, {
        name,
        code,
        yearLevel,
        weeklyFrequency: Number(weeklyFrequency),
        sessionDurationHours: Number(sessionDurationHours),
        color,
      });
    } else {
      addSubject({
        name,
        code,
        yearLevel,
        weeklyFrequency: Number(weeklyFrequency),
        sessionDurationHours: Number(sessionDurationHours),
        color,
      });
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-900" />
            College Subjects & Courses
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage course catalog, assigned college year levels, session durations, and weekly frequencies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md h-fit">
          <h2 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2">
            {editingId ? <Edit2 className="w-5 h-5 text-blue-900" /> : <Plus className="w-5 h-5 text-amber-500" />}
            {editingId ? 'Edit Subject' : 'Add New Course Subject'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
              <input
                type="text"
                required
                placeholder="e.g. CS101 - Intro to Programming"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS101"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Year Level</label>
                <select
                  value={yearLevel}
                  onChange={e => setYearLevel(e.target.value as CollegeYearLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 text-sm"
                >
                  {YEAR_LEVELS.map(yl => (
                    <option key={yl} value={yl}>{yl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Frequency</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={weeklyFrequency}
                  onChange={e => setWeeklyFrequency(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Duration (Hrs)</label>
                <select
                  value={sessionDurationHours}
                  onChange={e => setSessionDurationHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 text-sm"
                >
                  <option value={1}>1.0 Hour</option>
                  <option value={1.5}>1.5 Hours</option>
                  <option value={2}>2.0 Hours</option>
                  <option value={3}>3.0 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Color Tag</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-10 h-9 bg-slate-50 border border-slate-300 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-mono">{color}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Save Changes' : 'Add Subject'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-3 rounded-lg text-sm flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Subjects List Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
          {subjects.map(sub => (
            <div
              key={sub.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-900/40 transition shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    {sub.yearLevel}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-3 line-clamp-1">{sub.name}</h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Frequency: <strong className="text-slate-900">{sub.weeklyFrequency}x / week</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Duration: <strong className="text-slate-900">{sub.sessionDurationHours || 1} hrs / session</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(sub)}
                  className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                  title="Edit Subject"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSubject(sub.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="col-span-2 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              No course subjects defined yet. Add your first subject using the form.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
