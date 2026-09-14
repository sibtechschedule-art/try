import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { DayOfWeek, Teacher } from '../types';
import { UserCheck, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SubstitutionDrawer: React.FC = () => {
  const {
    settings,
    teachers,
    subjects,
    classrooms,
    masterSchedule,
    applySubstitution,
    checkTeacherConflict
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [draggedTeacherId, setDraggedTeacherId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Active slots for selected day
  const activeDaySlots = masterSchedule.filter(s => s.day === selectedDay);

  const handleDragStart = (e: React.DragEvent, teacher: Teacher) => {
    setDraggedTeacherId(teacher.id);
    e.dataTransfer.setData('text/plain', teacher.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverSlotId(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlotId(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const teacherId = e.dataTransfer.getData('text/plain') || draggedTeacherId;

    if (!teacherId) return;

    const targetSlot = masterSchedule.find(s => s.id === slotId);
    if (!targetSlot) return;

    // Smart Conflict Prevention Shield: check if teacher is already booked
    const hasConflict = checkTeacherConflict(teacherId, targetSlot.day, targetSlot.startTime, slotId);

    if (hasConflict) {
      const teacherName = teachers.find(t => t.id === teacherId)?.name || 'Teacher';
      setConflictWarning(
        `🚨 Smart Conflict Prevention Shield: ${teacherName} is already booked in another classroom on ${targetSlot.day} at ${targetSlot.startTime}!`
      );
      setTimeout(() => setConflictWarning(null), 5000);
    }

    // Apply substitution regardless or after warning
    applySubstitution(slotId, teacherId, 'Emergency absence assignment');

    setDraggedTeacherId(null);
    setDragOverSlotId(null);
  };

  return (
    <div className="substitute-container">
      <div className="substitute-header">
        <div>
          <h2><UserCheck className="icon" /> Emergency Teacher Substitution Pool</h2>
          <p>Drag available substitute teachers from the pool and drop them onto active schedule slots for instant replacement.</p>
        </div>

        {/* Day Selector */}
        <div className="day-selector-bar">
          {settings.days.map(day => (
            <button
              key={day}
              className={`day-tab-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict Prevention Shield Warning Toast */}
      {conflictWarning && (
        <div className="toast-danger">
          <ShieldAlert className="icon-sm" />
          <span>{conflictWarning}</span>
        </div>
      )}

      <div className="substitute-workspace-grid">
        {/* Left Drawer: Substitute Teacher Drag Pool */}
        <div className="teacher-pool-drawer">
          <div className="drawer-header">
            <h3><UserCheck className="icon-sm" /> Available Substitutes Pool</h3>
            <span className="badge-pill blue">{teachers.length} Teachers</span>
          </div>
          <p className="drawer-subtext">Grab a teacher card below and drop onto a slot on the right:</p>

          <div className="pool-list">
            {teachers.map(teacher => {
              return (
                <div
                  key={teacher.id}
                  draggable
                  onDragStart={e => handleDragStart(e, teacher)}
                  className={`pool-teacher-card ${draggedTeacherId === teacher.id ? 'dragging' : ''}`}
                >
                  <img
                    src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={teacher.name}
                    className="avatar-md"
                  />
                  <div className="pool-info">
                    <h4>{teacher.name}</h4>
                    <span className="location-tag">📍 {teacher.buildingLocation}</span>
                  </div>
                  <div className="drag-handle-icon" title="Drag to Substitute">⋮⋮</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Interactive Active Timetable Drag Target Slots */}
        <div className="timetable-drop-panel">
          <h3><AlertOctagon className="icon-sm" /> Active Schedule Slots for {selectedDay}</h3>
          <p className="panel-desc">Hover over any period slot with a teacher card to replace the instructor:</p>

          <div className="drop-slots-list">
            {activeDaySlots.length === 0 ? (
              <div className="empty-preview">No active slots for {selectedDay}.</div>
            ) : (
              activeDaySlots.map(slot => {
                const sub = subjects.find(s => s.id === slot.subjectId);
                const originalTeacher = teachers.find(t => t.id === (slot.originalTeacherId || slot.teacherId));
                const activeTeacher = teachers.find(t => t.id === (slot.substituteTeacherId || slot.teacherId));
                const room = classrooms.find(r => r.id === slot.classroomId);

                const isHovered = dragOverSlotId === slot.id;

                // Smart Conflict Prevention Check for visual warning badge during hover
                let willConflict = false;
                if (isHovered && draggedTeacherId) {
                  willConflict = checkTeacherConflict(draggedTeacherId, slot.day, slot.startTime, slot.id);
                }

                return (
                  <div
                    key={slot.id}
                    onDragOver={e => handleDragOver(e, slot.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, slot.id)}
                    className={`drop-slot-card ${isHovered ? 'drag-over' : ''} ${willConflict ? 'conflict-hover' : ''}`}
                  >
                    <div className="slot-left-col">
                      <div className="slot-period-tag">Period {slot.periodIndex}</div>
                      <div className="slot-time-str">{slot.startTime} - {slot.endTime}</div>
                    </div>

                    <div className="slot-mid-col">
                      <h4 style={{ color: sub?.color || '#3b82f6' }}>{sub?.name || 'Subject'}</h4>
                      <div className="slot-meta-tags">
                        <span className="badge-pill gray">{slot.gradeLevel} ({slot.sectionCode})</span>
                        <span className="badge-pill gray">🏛️ {room?.name}</span>
                      </div>
                    </div>

                    <div className="slot-right-col">
                      <div className="current-teacher-box">
                        <span className="label-sm">Assigned Instructor:</span>
                        <div className="teacher-badge-pill">
                          <img
                            src={activeTeacher?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={activeTeacher?.name}
                            className="avatar-xs"
                          />
                          <span>{activeTeacher?.name}</span>
                        </div>
                      </div>

                      {slot.isSubstituted && (
                        <div className="substituted-indicator">
                          <CheckCircle2 className="icon-xs text-green" />
                          <span>Replaced ({originalTeacher?.name})</span>
                        </div>
                      )}
                    </div>

                    {/* Smart Conflict Warning Badge Overlay on Drag Over */}
                    {willConflict && (
                      <div className="conflict-badge-overlay">
                        <ShieldAlert className="icon-xs" /> Conflict: Teacher Already Booked!
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
