import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { DayOfWeek } from '../types';
import {
  Sparkles,
  Users,
  DoorClosed,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    teachers,
    classrooms,
    subjects,
    scheduleSlots,
    settings,
    updateDailyOperatingHours,
    generateSchedule,
    bottlenecks,
  } = useSchedule();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleOperatingHoursChange = (
    day: DayOfWeek,
    field: 'enabled' | 'startTime' | 'endTime',
    value: any
  ) => {
    const currentDayConfig = settings.dailyOperatingHours[day] || {
      enabled: true,
      startTime: '07:00',
      endTime: '18:00',
    };

    updateDailyOperatingHours(day, {
      ...currentDayConfig,
      [field]: value,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* SIBTECH Master Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-blue-900 border border-amber-500/40 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SIBTECH Database-Backed Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              SIBTECH Central Operations & Schedule Dashboard
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Southwestern Institute of Business & Technology scheduling system. Generate conflict-free college master schedules, manage day-specific faculty availability, and lock room allocations automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={generateSchedule}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-extrabold text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Master Schedule
            </button>
          </div>
        </div>
      </div>

      {/* AI Bottlenecks Alert Banner */}
      {bottlenecks.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200/60 rounded-lg text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {bottlenecks.length} Timetable Bottleneck{bottlenecks.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Potential double bookings or heavy workload peaks flagged by AI Assistant.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai_assistant')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-xs rounded-lg transition shrink-0 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            Review Bottlenecks <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Total Faculty</span>
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-900 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{teachers.length}</div>
          <p className="text-xs text-slate-500 mt-1">Active Instructors</p>
        </div>

        <div
          onClick={() => onNavigate('classrooms')}
          className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Active Rooms</span>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700 group-hover:scale-110 transition">
              <DoorClosed className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{classrooms.length}</div>
          <p className="text-xs text-slate-500 mt-1">Auto-Locking Rooms</p>
        </div>

        <div
          onClick={() => onNavigate('subjects')}
          className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Course Catalog</span>
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{subjects.length}</div>
          <p className="text-xs text-slate-500 mt-1">College Subjects</p>
        </div>

        <div
          onClick={() => onNavigate('schedule')}
          className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-xl p-5 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Scheduled Sessions</span>
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700 group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{scheduleSlots.length}</div>
          <p className="text-xs text-slate-500 mt-1">Master Timetable Slots</p>
        </div>
      </div>

      {/* School Operating Hours Configurator Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-900" />
              School Operating Hours Configurator
            </h2>
            <p className="text-slate-600 text-xs mt-0.5">
              Define daily operating time pools (e.g., Mon-Fri 7:00 AM – 9:00 PM). Global master availability for all SIBTECH classrooms.
            </p>
          </div>

          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Operating Hours Updated
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DAYS_OF_WEEK.map(day => {
            const dayConfig = settings.dailyOperatingHours[day] || {
              enabled: true,
              startTime: '07:00',
              endTime: '21:00',
            };

            return (
              <div
                key={day}
                className={`p-4 rounded-xl border transition ${
                  dayConfig.enabled
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dayConfig.enabled}
                      onChange={e => handleOperatingHoursChange(day, 'enabled', e.target.checked)}
                      className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span className="text-sm font-bold text-blue-950">{day}</span>
                  </label>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                </div>

                {dayConfig.enabled ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Opening Time</span>
                      <input
                        type="time"
                        value={dayConfig.startTime}
                        onChange={e => handleOperatingHoursChange(day, 'startTime', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Closing Time</span>
                      <input
                        type="time"
                        value={dayConfig.endTime}
                        onChange={e => handleOperatingHoursChange(day, 'endTime', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-4 text-center">
                    Campus Closed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div>
        <h3 className="text-base font-bold text-blue-950 mb-4">Quick Navigation Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigate('schedule')}
            className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-xl p-5 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-blue-50 rounded-lg text-blue-900">
                  <Calendar className="w-5 h-5" />
                </span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Master Schedule Grid</h4>
              <p className="text-xs text-slate-600">
                View matrix timetable, edit blocks manually, jumble room assignments, and print clean paper formats.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-900 mt-4 inline-block">Open Timetable Grid →</span>
          </div>

          <div
            onClick={() => onNavigate('substitutions')}
            className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-xl p-5 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-amber-50 rounded-lg text-amber-700">
                  <Users className="w-5 h-5" />
                </span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Emergency Substitution Pool</h4>
              <p className="text-xs text-slate-600">
                Drag and drop available substitute teachers onto scheduled slots with real-time conflict protection.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-4 inline-block">Manage Substitutions →</span>
          </div>

          <div
            onClick={() => onNavigate('export_hub')}
            className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-xl p-5 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700">
                  <Sparkles className="w-5 h-5" />
                </span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Export & Integration Hub</h4>
              <p className="text-xs text-slate-600">
                Export faculty schedules directly to Google Calendar (.ics) or download administrative CSV summaries.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 mt-4 inline-block">Export Calendar / CSV →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
