import React, { useState } from 'react';
import type { Episode, DailyScheduleItem } from '../types';
import { generateYouTubeMetadata } from '../services/youtubeMetadataService';
import { PlaySquare, Copy, Check, Calendar, Tag, FileText } from 'lucide-react';

interface YouTubeAutomationProps {
  episode: Episode;
  scheduleList: DailyScheduleItem[];
  onAddScheduleItem: (item: DailyScheduleItem) => void;
}

export const YouTubeAutomation: React.FC<YouTubeAutomationProps> = ({ episode, scheduleList, onAddScheduleItem }) => {
  const metadata = episode.youtubeMetadata || generateYouTubeMetadata(episode);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleScheduleEpisode = () => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: DailyScheduleItem = {
      id: `sched-${Date.now()}`,
      date: today,
      episodeNumber: episode.episodeNumber,
      seriesTitle: episode.seriesTitle,
      episodeTitle: episode.title,
      status: 'generated',
      targetDurationMin: 5,
      theme: episode.theme
    };
    onAddScheduleItem(newItem);
    alert(`Episode ${episode.episodeNumber} scheduled for YouTube publication!`);
  };

  return (
    <div className="youtube-automation-container">
      <div className="automation-header">
        <div>
          <h2><PlaySquare className="icon text-red" /> YouTube Automation Channel Suite</h2>
          <p className="subtitle">AI-generated click-ready YouTube SEO metadata, tags, timestamps & daily release planner.</p>
        </div>

        <button onClick={handleScheduleEpisode} className="schedule-btn">
          <Calendar /> Schedule for Daily Release
        </button>
      </div>

      <div className="automation-grid">
        {/* Metadata Details */}
        <div className="metadata-card">
          <div className="card-header">
            <h3><FileText className="icon" /> Video Title & Description</h3>
            <button
              onClick={() => handleCopy(`${metadata.title}\n\n${metadata.description}`, 'full')}
              className="copy-btn"
            >
              {copiedField === 'full' ? <Check /> : <Copy />}
              {copiedField === 'full' ? 'Copied All!' : 'Copy Metadata'}
            </button>
          </div>

          <div className="form-group">
            <label>YouTube Video Title (SEO Optimized)</label>
            <div className="copy-input-row">
              <input type="text" readOnly value={metadata.title} />
              <button onClick={() => handleCopy(metadata.title, 'title')} className="copy-icon-btn">
                {copiedField === 'title' ? <Check /> : <Copy />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Video Description & Timestamps</label>
            <div className="copy-input-row">
              <textarea readOnly rows={10} value={metadata.description} />
              <button onClick={() => handleCopy(metadata.description, 'desc')} className="copy-icon-btn">
                {copiedField === 'desc' ? <Check /> : <Copy />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label><Tag className="icon-sm" /> YouTube Video Tags ({metadata.tags.length} tags)</label>
            <div className="tags-flex">
              {metadata.tags.map((tag, idx) => (
                <span key={idx} className="tag-chip">#{tag}</span>
              ))}
            </div>
            <button onClick={() => handleCopy(metadata.tags.join(', '), 'tags')} className="copy-btn-sm">
              {copiedField === 'tags' ? <Check /> : <Copy />} Copy Tags CS-List
            </button>
          </div>
        </div>

        {/* Daily Schedule & Automation Planner */}
        <div className="planner-card">
          <h3><Calendar className="icon" /> Daily Channel Release Schedule</h3>
          <p className="card-subtitle">Keep your YouTube channel algorithm growing with consistent daily episode drops.</p>

          <div className="schedule-list font-sans">
            {scheduleList.length === 0 ? (
              <div className="empty-schedule">
                <p>No scheduled daily episodes yet. Click "Schedule for Daily Release" above to start your daily calendar.</p>
              </div>
            ) : (
              scheduleList.map((item) => (
                <div key={item.id} className="schedule-row">
                  <div className="schedule-info">
                    <span className="schedule-ep font-bold">Ep {item.episodeNumber}</span>
                    <span className="schedule-title">{item.episodeTitle}</span>
                  </div>
                  <div className="schedule-meta">
                    <span className="schedule-date">{item.date}</span>
                    <span className={`status-badge ${item.status}`}>{item.status.toUpperCase()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
