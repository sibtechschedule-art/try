import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { DayOfWeek } from '../types';
import { Sliders, Save, Wand2, Clock, Calendar, CheckCircle } from 'lucide-react';

const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const SettingsModule: React.FC = () => {
  const { settings, updateSettings, handleGenerateSchedule } = useSchedule();

  // Local Form State
  const [operatingStartTime, setOperatingStartTime] = useState(settings.operatingStartTime);
  const [operatingEndTime, setOperatingEndTime] = useState(settings.operatingEndTime);
  const [periodDurationMinutes, setPeriodDurationMinutes] = useState(settings.periodDurationMinutes);
  const [days, setDays] = useState<DayOfWeek[]>(settings.days);
  const [lunchBreakStart, setLunchBreakStart] = useState(settings.lunchBreakStart || '12:00');
  const [lunchBreakEnd, setLunchBreakEnd] = useState(settings.lunchBreakEnd || '13:00');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDay = (day: DayOfWeek) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      operatingStartTime,
      operatingEndTime,
      periodDurationMinutes,
      days,
      lunchBreakStart,
      lunchBreakEnd
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRegenerate = () => {
    handleSubmit(new Event('submit') as any);
    handleGenerateSchedule();
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2><Sliders className="icon" /> Operational School Settings</h2>
          <p>Configure core operational parameters, operating hours, period duration lengths, and active weekdays.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="toast-success">
          <CheckCircle className="icon-sm" /> Operational settings saved successfully!
        </div>
      )}

      <form className="crud-form-panel" onSubmit={handleSubmit}>
        <h3>School Schedule Parameters</h3>

        <div className="form-grid-2">
          <div className="form-group">
            <label><Clock className="icon-xs" /> School Start Time</label>
            <input
              type="time"
              required
              value={operatingStartTime}
              onChange={e => setOperatingStartTime(e.target.value)}
            />
            <small className="help-text">Standard opening bell hour (e.g. 08:00 AM)</small>
          </div>

          <div className="form-group">
            <label><Clock className="icon-xs" /> School Dismissal Time</label>
            <input
              type="time"
              required
              value={operatingEndTime}
              onChange={e => setOperatingEndTime(e.target.value)}
            />
            <small className="help-text">Standard dismissal bell hour (e.g. 04:00 PM)</small>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Standard Period / Class Duration (Minutes)</label>
            <select
              value={periodDurationMinutes}
              onChange={e => setPeriodDurationMinutes(parseInt(e.target.value))}
            >
              <option value={45}>45 Minutes</option>
              <option value={50}>50 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
              <option value={90}>90 Minutes (Block Period)</option>
            </select>
            <small className="help-text">Duration for each individual class period</small>
          </div>

          <div className="form-group">
            <label><Calendar className="icon-xs" /> Active School Days</label>
            <div className="checkbox-tags-row">
              {ALL_DAYS.map(day => (
                <button
                  type="button"
                  key={day}
                  className={`tag-toggle-btn ${days.includes(day) ? 'active' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Lunch Break Window Start</label>
            <input
              type="time"
              value={lunchBreakStart}
              onChange={e => setLunchBreakStart(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Lunch Break Window End</label>
            <input
              type="time"
              value={lunchBreakEnd}
              onChange={e => setLunchBreakEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions-row">
          <button type="submit" className="btn-primary">
            <Save className="icon-sm" /> Save Settings
          </button>

          <button type="button" onClick={handleRegenerate} className="btn-primary-sparkle">
            <Wand2 className="icon-sm" /> Save & Re-Generate Master Schedule
          </button>
        </div>
      </form>
    </div>
  );
};
