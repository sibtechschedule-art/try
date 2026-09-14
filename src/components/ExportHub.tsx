import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Download, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const ExportHub: React.FC = () => {
  const { scheduleSlots, subjects, teachers, classrooms } = useSchedule();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const generateICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Schedulify//Master College Timetable//EN',
    ];

    scheduleSlots.forEach(slot => {
      const subject = subjects.find(s => s.id === slot.subjectId);
      const teacher = teachers.find(t => t.id === (slot.substituteTeacherId || slot.teacherId));
      const room = classrooms.find(r => r.id === slot.classroomId);

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`SUMMARY:${subject?.code || 'CLASS'} - ${subject?.name || 'Session'}`);
      icsContent.push(`DESCRIPTION:Instructor: ${teacher?.name || 'TBD'} | Section: ${slot.sectionCode}`);
      icsContent.push(`LOCATION:${room?.roomNumber || 'Room TBD'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'schedulify_master_timetable.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Exported Google Calendar (.ics) file successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const generateCSV = () => {
    const headers = ['Day', 'Start Time', 'End Time', 'Subject Code', 'Subject Name', 'Instructor', 'Classroom', 'Section Code'];
    const rows = scheduleSlots.map(slot => {
      const subject = subjects.find(s => s.id === slot.subjectId);
      const teacher = teachers.find(t => t.id === (slot.substituteTeacherId || slot.teacherId));
      const room = classrooms.find(r => r.id === slot.classroomId);

      return [
        slot.day,
        slot.startTime,
        slot.endTime,
        `"${subject?.code || ''}"`,
        `"${subject?.name || ''}"`,
        `"${teacher?.name || ''}"`,
        `"${room?.roomNumber || ''}"`,
        `"${slot.sectionCode || ''}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'schedulify_timetable_summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Downloaded Administrative CSV Summary!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Download className="w-7 h-7 text-indigo-400" />
          Export & Integration Hub
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Export master schedules to Google Calendar (.ics) or download clean CSV summaries for payroll and archiving.
        </p>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-600 rounded-xl p-4 flex items-center gap-3 text-emerald-200 text-xs font-semibold shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ICS Calendar Export */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 w-fit mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Google Calendar Export (.ics)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate an iCalendar file compatible with Google Calendar, Apple Calendar, and Outlook to sync faculty timetables across mobile devices.
            </p>
          </div>

          <button
            onClick={generateICS}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download .ics iCal File
          </button>
        </div>

        {/* CSV Summary Export */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Administrative CSV Summary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download a comprehensive CSV spreadsheet containing all class sessions, teacher assignments, and classroom bookings for payroll and archiving.
            </p>
          </div>

          <button
            onClick={generateCSV}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download CSV Summary
          </button>
        </div>
      </div>
    </div>
  );
};
