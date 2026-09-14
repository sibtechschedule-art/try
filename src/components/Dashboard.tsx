import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import {
  Users,
  School,
  BookOpen,
  Calendar,
  Wand2,
  PlusCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    teachers,
    classrooms,
    subjects,
    masterSchedule,
    bottlenecks,
    substitutions,
    setActiveTab,
    handleGenerateSchedule
  } = useSchedule();

  // Quick stats
  const totalTeachers = teachers.length;
  const totalClassrooms = classrooms.length;
  const totalSubjects = subjects.length;
  const totalScheduledSlots = masterSchedule.length;
  const totalConflicts = bottlenecks.length;
  const activeSubstitutionsCount = substitutions.filter(s => s.status === 'active').length;

  // Today's schedule preview (e.g., Monday)
  const todaySlots = masterSchedule.filter(s => s.day === 'Monday').slice(0, 6);

  return (
    <div className="dashboard-container">
      {/* Hero Welcome & Quick Action Header */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h2>Automated School Master Schedule Dashboard</h2>
          <p>
            Real-time timetable allocation engine, dynamic constraint resolution, emergency substitution, and AI conflict optimization.
          </p>
        </div>
        <div className="hero-actions">
          <button onClick={handleGenerateSchedule} className="btn-primary-sparkle">
            <Wand2 className="icon" /> Generate Master Schedule
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('teachers')}>
          <div className="stat-icon-wrapper blue">
            <Users className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Teachers</span>
            <span className="stat-value">{totalTeachers}</span>
            <span className="stat-subtext">Educators configured</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('classrooms')}>
          <div className="stat-icon-wrapper green">
            <School className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Registered Classrooms</span>
            <span className="stat-value">{totalClassrooms}</span>
            <span className="stat-subtext">Labs & Lecture Rooms</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('subjects')}>
          <div className="stat-icon-wrapper amber">
            <BookOpen className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Curriculum Subjects</span>
            <span className="stat-value">{totalSubjects}</span>
            <span className="stat-subtext">Required courses</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('schedule')}>
          <div className="stat-icon-wrapper purple">
            <Calendar className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Scheduled Slots</span>
            <span className="stat-value">{totalScheduledSlots}</span>
            <span className="stat-subtext">Weekly class periods</span>
          </div>
        </div>
      </div>

      {/* Alert Banner if Bottlenecks exist */}
      {totalConflicts > 0 && (
        <div className="alert-banner" onClick={() => setActiveTab('assistant')}>
          <div className="alert-content">
            <AlertTriangle className="alert-icon text-amber" />
            <div>
              <strong>AI Conflict Assistant Flagged {totalConflicts} Bottleneck(s)!</strong>
              <p>Click here to review distant building switches or back-to-back workload warnings.</p>
            </div>
          </div>
          <button className="btn-alert-action">
            Review Bottlenecks <ArrowRight className="icon-sm" />
          </button>
        </div>
      )}

      {/* Quick Action Navigation Cards & Master Schedule Overview */}
      <div className="dashboard-grid-layout">
        {/* Left Column: Quick Action Cards */}
        <div className="card-panel">
          <h3>⚡ Quick Data Input & Generator Shortcuts</h3>
          <p className="panel-desc">Jump straight into setup or emergency management:</p>

          <div className="quick-actions-list">
            <button className="quick-action-btn" onClick={() => setActiveTab('subjects')}>
              <div className="qa-icon-box blue"><PlusCircle className="icon" /></div>
              <div className="qa-text">
                <strong>Add / Manage Subjects</strong>
                <span>Set required weekly frequency and grade levels</span>
              </div>
              <ArrowRight className="qa-arrow" />
            </button>

            <button className="quick-action-btn" onClick={() => setActiveTab('teachers')}>
              <div className="qa-icon-box green"><Users className="icon" /></div>
              <div className="qa-text">
                <strong>Manage Teacher Profiles</strong>
                <span>Assign subjects, weekly limits & daily availability</span>
              </div>
              <ArrowRight className="qa-arrow" />
            </button>

            <button className="quick-action-btn" onClick={() => setActiveTab('classrooms')}>
              <div className="qa-icon-box purple"><School className="icon" /></div>
              <div className="qa-text">
                <strong>Manage Classrooms</strong>
                <span>Configure room capacities & operational hours</span>
              </div>
              <ArrowRight className="qa-arrow" />
            </button>

            <button className="quick-action-btn" onClick={() => setActiveTab('substitute')}>
              <div className="qa-icon-box red"><UserCheck className="icon" /></div>
              <div className="qa-text">
                <strong>Emergency Substitution Pool</strong>
                <span>Drag-and-drop replacement teachers ({activeSubstitutionsCount} active)</span>
              </div>
              <ArrowRight className="qa-arrow" />
            </button>
          </div>
        </div>

        {/* Right Column: Visual Overview of Today's Master Schedule */}
        <div className="card-panel">
          <div className="panel-header-row">
            <h3><Calendar className="icon" /> Today's Generated Master Schedule (Monday)</h3>
            <button className="btn-link" onClick={() => setActiveTab('schedule')}>
              View Full Matrix <ArrowRight className="icon-sm" />
            </button>
          </div>

          <div className="schedule-preview-list">
            {todaySlots.length === 0 ? (
              <div className="empty-preview">
                <Clock className="empty-icon" />
                <p>No slots generated for today yet.</p>
                <button onClick={handleGenerateSchedule} className="btn-secondary">
                  Generate Schedule Now
                </button>
              </div>
            ) : (
              todaySlots.map(slot => {
                const sub = subjects.find(s => s.id === slot.subjectId);
                const teacher = teachers.find(t => t.id === (slot.substituteTeacherId || slot.teacherId));
                const room = classrooms.find(r => r.id === slot.classroomId);

                return (
                  <div key={slot.id} className="preview-slot-card">
                    <div className="slot-time-badge">
                      <Clock className="icon-xs" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>

                    <div className="slot-main-info">
                      <h4 style={{ color: sub?.color || '#3b82f6' }}>{sub?.name || 'Subject'}</h4>
                      <p className="slot-meta">
                        <span>{slot.gradeLevel} ({slot.sectionCode})</span> • <span>{room?.name}</span>
                      </p>
                    </div>

                    <div className="slot-teacher-pill">
                      <img
                        src={teacher?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={teacher?.name}
                        className="teacher-avatar-xs"
                      />
                      <span>{teacher?.name}</span>
                      {slot.isSubstituted && <span className="sub-badge">SUB</span>}
                    </div>
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
