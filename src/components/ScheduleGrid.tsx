import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { generateTimeSlots } from '../services/scheduleGenerator';
import type { ScheduleSlot, DayOfWeek } from '../types';
import { Calendar, Printer, Edit3, X, Save, Wand2 } from 'lucide-react';

export const ScheduleGrid: React.FC = () => {
  const {
    settings,
    masterSchedule,
    subjects,
    teachers,
    classrooms,
    updateScheduleSlot,
    handleGenerateSchedule
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [viewMode, setViewMode] = useState<'day_vs_room' | 'week_vs_period'>('day_vs_room');
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  // Edit Modal Form State
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editClassroomId, setEditClassroomId] = useState('');

  const timeSlots = generateTimeSlots(settings);
  const days = settings.days;

  const handleOpenEdit = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setEditSubjectId(slot.subjectId);
    setEditTeacherId(slot.substituteTeacherId || slot.teacherId);
    setEditClassroomId(slot.classroomId);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    updateScheduleSlot({
      ...editingSlot,
      subjectId: editSubjectId,
      teacherId: editTeacherId,
      classroomId: editClassroomId
    });

    setEditingSlot(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="schedule-container">
      {/* Top Controls Header */}
      <div className="schedule-header no-print">
        <div>
          <h2><Calendar className="icon" /> Master Timetable Schedule Grid</h2>
          <p>Matrix view of generated periods across classrooms and days. Click any slot to edit or reassign.</p>
        </div>

        <div className="header-actions">
          <div className="view-toggle-group">
            <button
              className={`toggle-btn ${viewMode === 'day_vs_room' ? 'active' : ''}`}
              onClick={() => setViewMode('day_vs_room')}
            >
              Day / Rooms View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'week_vs_period' ? 'active' : ''}`}
              onClick={() => setViewMode('week_vs_period')}
            >
              Weekly Overview Matrix
            </button>
          </div>

          <button onClick={handleGenerateSchedule} className="btn-secondary">
            <Wand2 className="icon-sm" /> Re-Generate
          </button>

          <button onClick={handlePrint} className="btn-primary">
            <Printer className="icon-sm" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Day Selector (for Day / Rooms View) */}
      {viewMode === 'day_vs_room' && (
        <div className="day-selector-bar no-print">
          {days.map(day => (
            <button
              key={day}
              className={`day-tab-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Printable Timetable Title for PDF */}
      <div className="print-only-header">
        <h1>School Master Timetable Schedule</h1>
        <p>Generated on {new Date().toLocaleDateString()} | Active Operating Hours: {settings.operatingStartTime} - {settings.operatingEndTime}</p>
      </div>

      {/* Schedule Grid Matrix */}
      <div className="schedule-matrix-wrapper">
        {viewMode === 'day_vs_room' ? (
          // View Mode 1: Rows = Time Periods, Columns = Classrooms (for a selected Day)
          <table className="schedule-grid-table">
            <thead>
              <tr>
                <th className="time-col-header">Time Slot</th>
                {classrooms.map(room => (
                  <th key={room.id} className="room-col-header">
                    <div>{room.roomNumber}</div>
                    <span className="room-sub">{room.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot.startTime}>
                  <td className="time-cell">
                    <div className="period-badge">P{slot.periodIndex}</div>
                    <div className="time-str">{slot.startTime} - {slot.endTime}</div>
                  </td>

                  {classrooms.map(room => {
                    const match = masterSchedule.find(
                      s => s.day === selectedDay && s.startTime === slot.startTime && s.classroomId === room.id
                    );

                    if (!match) {
                      return <td key={room.id} className="empty-slot-cell">—</td>;
                    }

                    const subject = subjects.find(sub => sub.id === match.subjectId);
                    const teacher = teachers.find(t => t.id === (match.substituteTeacherId || match.teacherId));

                    return (
                      <td key={room.id} className="grid-slot-cell" onClick={() => handleOpenEdit(match)}>
                        <div className="slot-card" style={{ borderLeftColor: subject?.color || '#3b82f6' }}>
                          <div className="slot-subject-title" style={{ color: subject?.color || '#3b82f6' }}>
                            {subject?.name || 'Subject'}
                          </div>

                          <div className="slot-grade-badge">
                            {match.gradeLevel} ({match.sectionCode})
                          </div>

                          <div className="slot-teacher-name">
                            <span>👤 {teacher?.name || 'Teacher'}</span>
                            {match.isSubstituted && <span className="sub-badge-mini">SUB</span>}
                          </div>

                          <div className="slot-edit-overlay">
                            <Edit3 className="icon-xs" /> Edit
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // View Mode 2: Rows = Time Periods, Columns = Days of the Week
          <table className="schedule-grid-table">
            <thead>
              <tr>
                <th className="time-col-header">Time Slot</th>
                {days.map(day => (
                  <th key={day} className="day-col-header">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot.startTime}>
                  <td className="time-cell">
                    <div className="period-badge">P{slot.periodIndex}</div>
                    <div className="time-str">{slot.startTime} - {slot.endTime}</div>
                  </td>

                  {days.map(day => {
                    const matches = masterSchedule.filter(
                      s => s.day === day && s.startTime === slot.startTime
                    );

                    return (
                      <td key={day} className="grid-slot-cell-multi">
                        {matches.length === 0 ? (
                          <span className="empty-cell-text">—</span>
                        ) : (
                          matches.map(match => {
                            const subject = subjects.find(sub => sub.id === match.subjectId);
                            const teacher = teachers.find(t => t.id === (match.substituteTeacherId || match.teacherId));
                            const room = classrooms.find(r => r.id === match.classroomId);

                            return (
                              <div
                                key={match.id}
                                className="slot-card-compact"
                                style={{ borderLeftColor: subject?.color || '#3b82f6' }}
                                onClick={() => handleOpenEdit(match)}
                              >
                                <strong style={{ color: subject?.color || '#3b82f6' }}>{subject?.name}</strong>
                                <div className="compact-meta">
                                  <span>{match.sectionCode}</span> • <span>{room?.roomNumber}</span>
                                </div>
                                <div className="compact-teacher">{teacher?.name}</div>
                              </div>
                            );
                          })
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Slot Edit Modal */}
      {editingSlot && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Timetable Slot</h3>
              <button className="btn-icon" onClick={() => setEditingSlot(null)}>
                <X className="icon-sm" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="slot-meta-summary">
                <span>Day: <strong>{editingSlot.day}</strong></span> |
                <span> Time: <strong>{editingSlot.startTime} - {editingSlot.endTime}</strong></span> |
                <span> Section: <strong>{editingSlot.sectionCode}</strong></span>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select value={editSubjectId} onChange={e => setEditSubjectId(e.target.value)}>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Educator / Teacher</label>
                <select value={editTeacherId} onChange={e => setEditTeacherId(e.target.value)}>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.buildingLocation})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Classroom</label>
                <select value={editClassroomId} onChange={e => setEditClassroomId(e.target.value)}>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.roomNumber} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingSlot(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="icon-sm" /> Save Slot Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
