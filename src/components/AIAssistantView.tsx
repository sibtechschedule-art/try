import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Bot, AlertTriangle, Wand2, ShieldCheck, RefreshCw } from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { bottlenecks, resolveBottleneck, handleGenerateSchedule, masterSchedule } = useSchedule();

  return (
    <div className="assistant-container">
      <div className="assistant-header">
        <div className="assistant-hero-title">
          <Bot className="bot-icon" />
          <div>
            <h2>AI Conflict Resolution & Optimization Assistant</h2>
            <p>Intelligent scanner that continuously audits generated schedules for double-booking bottlenecks, back-to-back burnout, and distant building transit times.</p>
          </div>
        </div>

        <button onClick={handleGenerateSchedule} className="btn-secondary">
          <RefreshCw className="icon-sm" /> Re-Scan Timetable
        </button>
      </div>

      {/* Summary Audit Bar */}
      <div className="audit-summary-card">
        <div className="audit-stat">
          <span className="label">Total Timetable Slots Audited</span>
          <span className="value">{masterSchedule.length}</span>
        </div>
        <div className="audit-stat">
          <span className="label">Detected Bottlenecks</span>
          <span className={`value ${bottlenecks.length > 0 ? 'text-amber' : 'text-green'}`}>
            {bottlenecks.length}
          </span>
        </div>
        <div className="audit-stat">
          <span className="label">System Health Index</span>
          <span className={`value ${bottlenecks.length === 0 ? 'text-green' : 'text-blue'}`}>
            {bottlenecks.length === 0 ? '100% Conflict-Free' : `${Math.max(60, 100 - bottlenecks.length * 10)}% Optimized`}
          </span>
        </div>
      </div>

      {/* Bottlenecks List or Clean State */}
      <div className="bottlenecks-list-section">
        <h3><AlertTriangle className="icon" /> Scanned Schedule Bottlenecks ({bottlenecks.length})</h3>

        {bottlenecks.length === 0 ? (
          <div className="clean-schedule-banner">
            <ShieldCheck className="clean-icon text-green" />
            <div>
              <h3>All Clear! Zero Scheduling Bottlenecks Detected</h3>
              <p>Your master schedule strictly conforms to all teacher availability limits, classroom capacities, and campus transit rules.</p>
            </div>
          </div>
        ) : (
          bottlenecks.map(btn => (
            <div key={btn.id} className={`bottleneck-card severity-${btn.severity}`}>
              <div className="bn-header">
                <div className="bn-title-group">
                  <span className={`severity-badge ${btn.severity}`}>{btn.severity.toUpperCase()}</span>
                  <h4>{btn.title}</h4>
                </div>
                <button className="btn-primary-sparkle" onClick={() => resolveBottleneck(btn.id)}>
                  <Wand2 className="icon-xs" /> 1-Click Auto Fix
                </button>
              </div>

              <p className="bn-desc">{btn.description}</p>

              {btn.suggestedFix && (
                <div className="suggested-fix-box">
                  <strong>💡 Suggested AI Fix Action:</strong>
                  <p>{btn.suggestedFix.description}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
