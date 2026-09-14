import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { bottlenecks, fixBottleneck, generateSchedule } = useSchedule();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-900/90 via-slate-800 to-indigo-950 border border-violet-700/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              AI Bottleneck & Conflict Audit Assistant
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Automated Schedule Optimizer
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Scans master schedules for double bookings, heavy daily teacher workloads, and room lock conflicts with 1-click automated fix suggestions.
            </p>
          </div>

          <button
            onClick={generateSchedule}
            className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Re-Scan Timetable
          </button>
        </div>
      </div>

      {bottlenecks.length === 0 ? (
        <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-12 text-center backdrop-blur-sm space-y-3">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Zero Bottlenecks Detected</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            The master timetable passes all conflict checks: teacher availability, maximum weekly load limits, and room locking rules.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Flagged Timetable Bottlenecks ({bottlenecks.length})
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {bottlenecks.map(b => (
              <div
                key={b.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      b.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {b.type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.severity === 'high' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {b.severity} Severity
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{b.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{b.description}</p>

                    {b.suggestedFix && (
                      <p className="text-xs text-indigo-300 mt-2 bg-indigo-950/60 border border-indigo-800/60 rounded-lg p-2.5 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span><strong>Suggested Fix:</strong> {b.suggestedFix.description}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => fixBottleneck(b.id)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition shrink-0 flex items-center justify-center gap-1.5"
                >
                  Apply 1-Click Fix <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
