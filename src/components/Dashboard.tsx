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
      {/* Schedulify Master Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-800 to-indigo-950 border border-indigo-700/50 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Schedulify Automated Engine v2.5
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              College Timetable & Operations Dashboard
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Generate conflict-free master schedules, manage day-specific teacher windows, lock classroom availability, and archive weekly timetables seamlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={generateSchedule}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Master Schedule
            </button>
          </div>
        </div>
      </div>

      {/* AI Bottlenecks Alert Banner */}
      {bottlenecks.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                {bottlenecks.length} Timetable Bottleneck{bottlenecks.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Potential double bookings or heavy workload peaks flagged by AI Assistant.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai_assistant')}
            className="px-4 py-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-semibold rounded-lg transition shrink-0 flex items-center justify-center gap-1.5"
          >
            Review Bottlenecks <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Faculty</span>
            <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{teachers.length}</div>
          <p className="text-xs text-slate-400 mt-1">Active Instructors</p>
        </div>

        <div
          onClick={() => onNavigate('classrooms')}
          className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Active Classrooms</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition">
              <DoorClosed className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{classrooms.length}</div>
          <p className="text-xs text-slate-400 mt-1">Auto-Locking Rooms</p>
        </div>

        <div
          onClick={() => onNavigate('subjects')}
          className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Course Catalog</span>
            <div className="p-2.5 bg-violet-500/10 rounded-lg text-violet-400 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{subjects.length}</div>
          <p className="text-xs text-slate-400 mt-1">College Subjects</p>
        </div>

        <div
          onClick={() => onNavigate('schedule')}
          className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Scheduled Sessions</span>
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{scheduleSlots.length}</div>
          <p className="text-xs text-slate-400 mt-1">Master Timetable Slots</p>
        </div>
      </div>

      {/* School Operating Hours Configurator Section */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              School Operating Hours Configurator
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Define daily operating time pools (e.g., Monday 7:00 AM – 6:00 PM). Serves as the global availability window for all classrooms.
            </p>
          </div>

          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" /> Operating Hours Updated
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DAYS_OF_WEEK.map(day => {
            const dayConfig = settings.dailyOperatingHours[day] || {
              enabled: true,
              startTime: '07:00',
              endTime: '18:00',
            };

            return (
              <div
                key={day}
                className={`p-4 rounded-xl border transition ${
                  dayConfig.enabled
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dayConfig.enabled}
                      onChange={e => handleOperatingHoursChange(day, 'enabled', e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-white">{day}</span>
                  </label>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                </div>

                {dayConfig.enabled ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Opening Time</span>
                      <input
                        type="time"
                        value={dayConfig.startTime}
                        onChange={e => handleOperatingHoursChange(day, 'startTime', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Closing Time</span>
                      <input
                        type="time"
                        value={dayConfig.endTime}
                        onChange={e => handleOperatingHoursChange(day, 'endTime', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-4 text-center">
                    School Closed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Quick Navigation Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigate('schedule')}
            className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </span>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Master Schedule Grid</h4>
              <p className="text-xs text-slate-400">
                View matrix timetable, edit blocks manually, jumble room assignments, and print clean paper formats.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 mt-4 inline-block">Open Timetable Grid →</span>
          </div>

          <div
            onClick={() => onNavigate('substitutions')}
            className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Users className="w-5 h-5" />
                </span>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Emergency Substitution Pool</h4>
              <p className="text-xs text-slate-400">
                Drag and drop available substitute teachers onto scheduled slots with real-time conflict protection.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 mt-4 inline-block">Manage Substitutions →</span>
          </div>

          <div
            onClick={() => onNavigate('export_hub')}
            className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-violet-500/10 rounded-lg text-violet-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Export & Integration Hub</h4>
              <p className="text-xs text-slate-400">
                Export faculty schedules directly to Google Calendar (.ics) or download administrative CSV summaries.
              </p>
            </div>
            <span className="text-xs font-semibold text-violet-400 mt-4 inline-block">Export Calendar / CSV →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
