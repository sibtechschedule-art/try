import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { Teacher, DayOfWeek } from '../types';
import { Users, Plus, Trash2, Edit3, Save, X, Activity, MapPin } from 'lucide-react';

const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const STANDARD_TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

export const TeachersModule: React.FC = () => {
  const { teachers, subjects, masterSchedule, addTeacher, updateTeacher, deleteTeacher } = useSchedule();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [qualifiedSubjectIds, setQualifiedSubjectIds] = useState<string[]>([]);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(20);
  const [buildingLocation, setBuildingLocation] = useState('Science Wing - Bldg A');
  const [blockedDays, setBlockedDays] = useState<DayOfWeek[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(STANDARD_TIME_SLOTS);

  const resetForm = () => {
    setName('');
    setEmail('');
    setQualifiedSubjectIds([]);
    setMaxWeeklyHours(20);
    setBuildingLocation('Science Wing - Bldg A');
    setBlockedDays([]);
    setAvailableTimeSlots(STANDARD_TIME_SLOTS);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (t: Teacher) => {
    setEditingId(t.id);
    setName(t.name);
    setEmail(t.email);
    setQualifiedSubjectIds(t.qualifiedSubjectIds);
    setMaxWeeklyHours(t.maxWeeklyHours);
    setBuildingLocation(t.buildingLocation);
    setBlockedDays(t.blockedDays);
    setAvailableTimeSlots(t.availableTimeSlots.length > 0 ? t.availableTimeSlots : STANDARD_TIME_SLOTS);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingId) {
      updateTeacher({
        id: editingId,
        name,
        email,
        qualifiedSubjectIds,
        maxWeeklyHours,
        buildingLocation,
        blockedDays,
        availableTimeSlots,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
      });
    } else {
      addTeacher({
        name,
        email,
        qualifiedSubjectIds,
        maxWeeklyHours,
        buildingLocation,
        blockedDays,
        availableTimeSlots,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
      });
    }
    resetForm();
  };

  const toggleSubject = (subId: string) => {
    setQualifiedSubjectIds(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const toggleBlockedDay = (day: DayOfWeek) => {
    setBlockedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSlot = (slot: string) => {
    setAvailableTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  // Helper to calculate workload percentage
  const getTeacherWorkload = (teacherId: string, maxHours: number) => {
    const assignedSlotsCount = masterSchedule.filter(
      s => (s.substituteTeacherId || s.teacherId) === teacherId
    ).length;
    const percentage = Math.min(100, Math.round((assignedSlotsCount / maxHours) * 100));
    return { assignedSlotsCount, percentage };
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2><Users className="icon" /> Teachers & Faculty Module</h2>
          <p>Manage teacher profiles, subject qualifications, building locations, availability windows, and track workload balance.</p>
        </div>
        {!isAdding && !editingId && (
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            <Plus className="icon-sm" /> Add New Teacher
          </button>
        )}
      </div>

      {/* Add / Edit Form Panel */}
      {(isAdding || editingId) && (
        <form className="crud-form-panel" onSubmit={handleSave}>
          <h3>{editingId ? 'Edit Teacher Profile' : 'Add New Teacher'}</h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dr. Eleanor Vance"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. e.vance@school.edu"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Building / Campus Base Location</label>
              <input
                type="text"
                value={buildingLocation}
                onChange={e => setBuildingLocation(e.target.value)}
                placeholder="e.g. Science Wing - Bldg A"
              />
            </div>

            <div className="form-group">
              <label>Maximum Weekly Teaching Hours (Capacity)</label>
              <input
                type="number"
                min="5"
                max="40"
                value={maxWeeklyHours}
                onChange={e => setMaxWeeklyHours(parseInt(e.target.value) || 20)}
              />
            </div>
          </div>

          {/* Qualified Subjects Selection */}
          <div className="form-group">
            <label>Qualified Subjects to Teach</label>
            <div className="checkbox-tags-row">
              {subjects.map(sub => (
                <button
                  type="button"
                  key={sub.id}
                  className={`tag-toggle-btn ${qualifiedSubjectIds.includes(sub.id) ? 'active' : ''}`}
                  onClick={() => toggleSubject(sub.id)}
                >
                  {sub.name} ({sub.gradeLevel})
                </button>
              ))}
            </div>
          </div>

          {/* Availability / Blocked Days Selection */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Blocked Out Days (Unavailable)</label>
              <div className="checkbox-tags-row">
                {ALL_DAYS.map(day => (
                  <button
                    type="button"
                    key={day}
                    className={`tag-toggle-btn danger ${blockedDays.includes(day) ? 'active' : ''}`}
                    onClick={() => toggleBlockedDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Available Daily Hours</label>
              <div className="checkbox-tags-row">
                {STANDARD_TIME_SLOTS.map(slot => (
                  <button
                    type="button"
                    key={slot}
                    className={`tag-toggle-btn ${availableTimeSlots.includes(slot) ? 'active' : ''}`}
                    onClick={() => toggleTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X className="icon-sm" /> Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save className="icon-sm" /> {editingId ? 'Save Changes' : 'Create Teacher'}
            </button>
          </div>
        </form>
      )}

      {/* Teachers List & Workload Balance Indicator */}
      <div className="teachers-cards-grid">
        {teachers.map(tch => {
          const { assignedSlotsCount, percentage } = getTeacherWorkload(tch.id, tch.maxWeeklyHours);
          const qualifiedSubNames = subjects
            .filter(s => tch.qualifiedSubjectIds.includes(s.id))
            .map(s => s.name);

          let loadColorClass = 'green';
          if (percentage > 85) loadColorClass = 'red';
          else if (percentage > 65) loadColorClass = 'amber';

          return (
            <div key={tch.id} className="teacher-card">
              <div className="teacher-header">
                <img
                  src={tch.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={tch.name}
                  className="teacher-avatar-lg"
                />
                <div className="teacher-details">
                  <h3>{tch.name}</h3>
                  <span className="teacher-email">{tch.email}</span>
                  <div className="teacher-location">
                    <MapPin className="icon-xs" /> {tch.buildingLocation}
                  </div>
                </div>
                <div className="card-top-actions">
                  <button className="btn-icon" onClick={() => handleStartEdit(tch)} title="Edit">
                    <Edit3 className="icon-xs" />
                  </button>
                  <button className="btn-icon danger" onClick={() => deleteTeacher(tch.id)} title="Delete">
                    <Trash2 className="icon-xs" />
                  </button>
                </div>
              </div>

              {/* Workload Balance Indicator Progress Bar */}
              <div className="workload-balance-box">
                <div className="workload-header">
                  <span className="workload-title"><Activity className="icon-xs" /> Weekly Workload Load</span>
                  <span className={`workload-value ${loadColorClass}`}>
                    {assignedSlotsCount} / {tch.maxWeeklyHours} hrs ({percentage}%)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className={`progress-bar-fill ${loadColorClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {percentage > 90 && (
                  <span className="workload-warning">⚠️ Near Maximum Capacity Limit!</span>
                )}
              </div>

              {/* Qualified Subjects Badges */}
              <div className="qualifications-box">
                <span className="section-label">Qualified Subjects:</span>
                <div className="badge-row">
                  {qualifiedSubNames.length === 0 ? (
                    <span className="text-muted">None specified</span>
                  ) : (
                    qualifiedSubNames.map((subName, i) => (
                      <span key={i} className="badge-pill blue">{subName}</span>
                    ))
                  )}
                </div>
              </div>

              {/* Blocked Days */}
              {tch.blockedDays.length > 0 && (
                <div className="blocked-days-box">
                  <span className="section-label">Blocked Days:</span>
                  <div className="badge-row">
                    {tch.blockedDays.map(day => (
                      <span key={day} className="badge-pill red">{day}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
