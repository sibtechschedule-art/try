import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { DayOfWeek } from '../types';
import { Smartphone, QrCode, Search, Clock, MapPin, UserCheck } from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { masterSchedule, subjects, teachers, classrooms, settings } = useSchedule();

  const [searchSectionCode, setSearchSectionCode] = useState('9-A');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');

  // Filter slots for section and day
  const filteredSlots = masterSchedule.filter(
    s => s.sectionCode.toLowerCase() === searchSectionCode.trim().toLowerCase() && s.day === selectedDay
  );

  return (
    <div className="student-portal-container">
      <div className="portal-header">
        <div>
          <h2><Smartphone className="icon" /> Student & Parent Mobile Portal</h2>
          <p>Lightweight, read-only mobile view for students and parents to check real-time room assignments and daily class updates.</p>
        </div>
      </div>

      <div className="portal-grid">
        {/* Left Column: Access Control & Search Card */}
        <div className="portal-search-card">
          <h3>🔐 Section Access Code</h3>
          <p>Enter your assigned section code or scan the QR code to load your real-time daily schedule.</p>

          <div className="search-input-group">
            <Search className="search-icon" />
            <input
              type="text"
              value={searchSectionCode}
              onChange={e => setSearchSectionCode(e.target.value)}
              placeholder="e.g. 9-A or 10-A"
            />
          </div>

          <div className="quick-sections">
            <span className="label-sm">Quick Select Section:</span>
            <div className="btn-chip-row">
              <button className="chip-btn" onClick={() => setSearchSectionCode('9-A')}>Section 9-A</button>
              <button className="chip-btn" onClick={() => setSearchSectionCode('10-A')}>Section 10-A</button>
            </div>
          </div>

          {/* Simulated QR Code Box */}
          <div className="qr-code-box">
            <QrCode className="qr-icon" />
            <div className="qr-text">
              <strong>Scan Mobile QR Code</strong>
              <span>Instant mobile bookmark link</span>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Mobile Screen View */}
        <div className="mobile-frame-wrapper">
          <div className="mobile-phone-frame">
            <div className="phone-top-notch" />

            <div className="phone-screen">
              <div className="phone-header">
                <div>
                  <span className="app-subtitle">Student Portal</span>
                  <h3>Section {searchSectionCode.toUpperCase()} Schedule</h3>
                </div>
                <span className="live-status-dot">LIVE</span>
              </div>

              {/* Day Tabs in Mobile View */}
              <div className="mobile-day-tabs">
                {settings.days.map(day => (
                  <button
                    key={day}
                    className={`m-day-btn ${selectedDay === day ? 'active' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Mobile Timeline Cards */}
              <div className="mobile-timeline">
                {filteredSlots.length === 0 ? (
                  <div className="empty-mobile-state">
                    <p>No classes scheduled for Section {searchSectionCode} on {selectedDay}.</p>
                  </div>
                ) : (
                  filteredSlots.map(slot => {
                    const sub = subjects.find(s => s.id === slot.subjectId);
                    const teacher = teachers.find(t => t.id === (slot.substituteTeacherId || slot.teacherId));
                    const room = classrooms.find(r => r.id === slot.classroomId);

                    return (
                      <div key={slot.id} className="mobile-slot-card">
                        <div className="m-time-pill">
                          <Clock className="icon-xs" /> {slot.startTime} - {slot.endTime}
                        </div>

                        <div className="m-slot-body" style={{ borderLeft: `4px solid ${sub?.color || '#3b82f6'}` }}>
                          <h4 style={{ color: sub?.color || '#3b82f6' }}>{sub?.name || 'Subject'}</h4>

                          <div className="m-meta-row">
                            <span><MapPin className="icon-xs" /> {room?.name || 'Classroom'} ({room?.roomNumber})</span>
                          </div>

                          <div className="m-teacher-row">
                            <img
                              src={teacher?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={teacher?.name}
                              className="avatar-xs"
                            />
                            <span>{teacher?.name}</span>
                            {slot.isSubstituted && <span className="sub-tag-mini"><UserCheck className="icon-xs" /> Sub</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
