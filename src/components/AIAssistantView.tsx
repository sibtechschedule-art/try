import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { bottlenecks, fixBottleneck, generateSchedule } = useSchedule();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-blue-900 border border-amber-500/40 rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SIBTECH Conflict Audit Assistant
            </div>
            <h1 className="text-3xl font-black text-white">
              Automated Schedule Optimizer
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl">
              Scans SIBTECH master schedules for double bookings, heavy daily teacher workloads, and room lock conflicts with 1-click automated fix suggestions.
            </p>
          </div>

          <button
            onClick={generateSchedule}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-extrabold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Re-Scan Timetable
          </button>
        </div>
      </div>

      {bottlenecks.length === 0 ? (
        <div className="bg-white border border-emerald-300 rounded-2xl p-12 text-center shadow-md space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Zero Bottlenecks Detected</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            The master timetable passes all conflict checks: teacher availability, maximum weekly load limits, and room locking rules.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Flagged Timetable Bottlenecks ({bottlenecks.length})
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {bottlenecks.map(b => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      b.severity === 'high'
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {b.type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.severity} Severity
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{b.description}</p>

                    {b.suggestedFix && (
                      <p className="text-xs text-blue-950 mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                        <span><strong>Suggested Fix:</strong> {b.suggestedFix.description}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => fixBottleneck(b.id)}
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Apply 1-Click Fix <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
