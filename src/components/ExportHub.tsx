import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Download, Calendar, FileSpreadsheet, Users, CheckCircle } from 'lucide-react';

export const ExportHub: React.FC = () => {
  const { masterSchedule, teachers, subjects, classrooms } = useSchedule();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Generate iCal (.ics) string for a teacher
  const generateICS = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const teacherSlots = masterSchedule.filter(
      s => (s.substituteTeacherId || s.teacherId) === teacherId
    );

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//School Master Schedule Engine//EN',
      `X-WR-CALNAME:Teaching Schedule - ${teacher.name}`
    ];

    teacherSlots.forEach(slot => {
      const sub = subjects.find(s => s.id === slot.subjectId);
      const room = classrooms.find(r => r.id === slot.classroomId);

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`SUMMARY:${sub?.name || 'Class'} (${slot.sectionCode})`);
      icsContent.push(`DESCRIPTION:Teaching ${sub?.name} in room ${room?.roomNumber}. Grade: ${slot.gradeLevel}`);
      icsContent.push(`LOCATION:${room?.name || 'Classroom'}, ${room?.building || 'Campus'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${teacher.name.replace(/\s+/g, '_')}_Schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Exported Google Calendar (.ics) file for ${teacher.name}!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Export CSV Summary for Payroll & Administration
  const exportCSVSummary = () => {
    let csvContent = 'Teacher Name,Email,Assigned Periods Count,Total Teaching Hours,Primary Building\n';

    teachers.forEach(teacher => {
      const assignedSlots = masterSchedule.filter(
        s => (s.substituteTeacherId || s.teacherId) === teacher.id
      );
      csvContent += `"${teacher.name}","${teacher.email}",${assignedSlots.length},${assignedSlots.length} hrs,"${teacher.buildingLocation}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Faculty_Teaching_Workload_Summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Exported clean CSV Summary for payroll & administrative archiving!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="export-hub-container">
      <div className="export-header">
        <div>
          <h2><Download className="icon" /> Export & Integration Hub</h2>
          <p>Export teacher schedules to Google Calendar (.ics files) or download CSV workload summaries for payroll and admin archiving.</p>
        </div>
      </div>

      {downloadSuccess && (
        <div className="toast-success">
          <CheckCircle className="icon-sm" /> {downloadSuccess}
        </div>
      )}

      <div className="export-grid-2">
        {/* Card 1: Google Calendar .ICS Export */}
        <div className="export-card">
          <div className="card-icon-header blue">
            <Calendar className="icon-lg" />
          </div>
          <h3>Google Calendar Sync (.ics File)</h3>
          <p>Generate downloadable iCalendar (.ics) files for individual faculty members to import directly into Google Calendar, Outlook, or Apple Calendar.</p>

          <div className="form-group">
            <label><Users className="icon-xs" /> Select Educator / Teacher</label>
            <select
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.buildingLocation})</option>
              ))}
            </select>
          </div>

          <button onClick={() => generateICS(selectedTeacherId)} className="btn-primary w-full">
            <Download className="icon-sm" /> Download Teacher iCal (.ics)
          </button>
        </div>

        {/* Card 2: Administrative CSV Summary Export */}
        <div className="export-card">
          <div className="card-icon-header green">
            <FileSpreadsheet className="icon-lg" />
          </div>
          <h3>Payroll & Admin CSV Archiving</h3>
          <p>Download a clean CSV spreadsheet report of all teacher assignments, total teaching hours, and building locations for payroll auditing and archives.</p>

          <div className="csv-preview-info">
            <span>Total Educators Included: <strong>{teachers.length}</strong></span>
            <span>Total Timetable Slots: <strong>{masterSchedule.length}</strong></span>
          </div>

          <button onClick={exportCSVSummary} className="btn-secondary w-full">
            <FileSpreadsheet className="icon-sm" /> Download Faculty CSV Summary
          </button>
        </div>
      </div>
    </div>
  );
};
