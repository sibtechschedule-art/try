import { useState, useEffect } from 'react';
import type { Episode, AgeGroup, ArtStyle, DailyScheduleItem } from './types';
import { generateStoryEpisode, generateDailySeriesSchedule } from './services/aiStoryService';
import { VideoStudio } from './components/VideoStudio';
import { ThumbnailEditor } from './components/ThumbnailEditor';
import { YouTubeAutomation } from './components/YouTubeAutomation';
import { Sparkles, Film, Image, PlaySquare, Calendar, Wand2, RefreshCw, BookOpen, Clock, Heart } from 'lucide-react';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'studio' | 'thumbnail' | 'automation' | 'scheduler'>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [scheduleList, setScheduleList] = useState<DailyScheduleItem[]>([]);

  // Generation form state
  const [seriesTitle, setSeriesTitle] = useState('Wonderland Adventures');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [theme, setTheme] = useState('Space Exploration & Cosmic Friendship');
  const [customTopic, setCustomTopic] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('6-8');
  const [artStyle, setArtStyle] = useState<ArtStyle>('3d-cartoon');
  const [minDurationSec] = useState(300); // strictly guaranteed 5+ mins

  // Pre-generate initial episode on load
  useEffect(() => {
    handleGenerateStory();
  }, []);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      const ep = await generateStoryEpisode({
        seriesTitle,
        episodeNumber,
        theme,
        ageGroup,
        artStyle,
        customTopic: customTopic.trim() ? customTopic : undefined,
        minDurationSec
      });
      setCurrentEpisode(ep);
    } catch (err) {
      console.error("Story generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddScheduleItem = (item: DailyScheduleItem) => {
    setScheduleList(prev => [...prev.filter(i => i.id !== item.id), item]);
  };

  const handleGenerate7DaySeries = async () => {
    setIsGenerating(true);
    try {
      const seriesOutline = await generateDailySeriesSchedule(seriesTitle, ageGroup, artStyle, episodeNumber);
      const newItems: DailyScheduleItem[] = seriesOutline.map((item, idx) => {
        const d = new Date();
        d.setDate(d.getDate() + idx);
        return {
          id: `sched-bulk-${Date.now()}-${idx}`,
          date: d.toISOString().split('T')[0],
          episodeNumber: item.episodeNumber || idx + 1,
          seriesTitle: seriesTitle,
          episodeTitle: item.title || `Episode ${idx + 1}`,
          status: 'planned',
          targetDurationMin: 5,
          theme: item.theme || ''
        };
      });
      setScheduleList(newItems);
      setActiveTab('scheduler');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="brand">
          <Sparkles className="brand-icon text-yellow" />
          <div>
            <h1 className="brand-title">KidStory AI Studio</h1>
            <span className="brand-tag">Free AI 5+ Min Video & YouTube Automation</span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <Wand2 className="tab-icon" /> AI Story Generator
          </button>
          <button
            className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
            disabled={!currentEpisode}
          >
            <Film className="tab-icon" /> 5+ Min Video Studio
          </button>
          <button
            className={`tab-btn ${activeTab === 'thumbnail' ? 'active' : ''}`}
            onClick={() => setActiveTab('thumbnail')}
            disabled={!currentEpisode}
          >
            <Image className="tab-icon" /> Thumbnail Studio
          </button>
          <button
            className={`tab-btn ${activeTab === 'automation' ? 'active' : ''}`}
            onClick={() => setActiveTab('automation')}
            disabled={!currentEpisode}
          >
            <PlaySquare className="tab-icon" /> YouTube Automation
          </button>
          <button
            className={`tab-btn ${activeTab === 'scheduler' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduler')}
          >
            <Calendar className="tab-icon" /> Daily Planner
          </button>
        </nav>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {activeTab === 'generator' && (
          <div className="generator-container">
            <div className="hero-banner">
              <h2>✨ Free AI Daily Kid Story & 5+ Min Video Generator</h2>
              <p>Create unlimited kid-friendly episodes with character consistency, morals, and instant 5+ minute YouTube video automation.</p>
            </div>

            <div className="generator-grid">
              {/* Configuration Panel */}
              <div className="panel config-panel">
                <h3><Wand2 className="icon" /> Story Parameters</h3>

                <div className="form-group">
                  <label>Series Name</label>
                  <input
                    type="text"
                    value={seriesTitle}
                    onChange={(e) => setSeriesTitle(e.target.value)}
                    placeholder="e.g. Little Explorers World"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Episode Number</label>
                    <input
                      type="number"
                      min="1"
                      value={episodeNumber}
                      onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Audience Age</label>
                    <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}>
                      <option value="3-5">3 - 5 Years (Toddlers)</option>
                      <option value="6-8">6 - 8 Years (Early Readers)</option>
                      <option value="9-12">9 - 12 Years (Middle Grade)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Story Preset Theme</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="Space Exploration & Cosmic Friendship">Space Exploration & Cosmic Friendship</option>
                    <option value="Undersea Adventures & Marine Conservation">Undersea Adventures & Marine Conservation</option>
                    <option value="Magical Forest & Animal Hero Rescue">Magical Forest & Animal Hero Rescue</option>
                    <option value="Dinosaur Kingdom & Time Travel Mystery">Dinosaur Kingdom & Time Travel Mystery</option>
                    <option value="Safari Kindness & Wildlife Mysteries">Safari Kindness & Wildlife Mysteries</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Custom Story Topic / Idea (Optional)</label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. A tiny dragon learning to share ice cream"
                  />
                </div>

                <div className="form-group">
                  <label>Art & Animation Style</label>
                  <select value={artStyle} onChange={(e) => setArtStyle(e.target.value as ArtStyle)}>
                    <option value="3d-cartoon">3D Cartoon (Pixar Style)</option>
                    <option value="disney-pixar">Disney Magical Animated Style</option>
                    <option value="storybook-illustration">Charming Storybook Illustration</option>
                    <option value="anime-kid">Cute Kid Anime (Ghibli Inspired)</option>
                    <option value="cute-water-color">Soft Watercolor Painting</option>
                  </select>
                </div>

                <div className="btn-group-column">
                  <button
                    onClick={handleGenerateStory}
                    className="generate-btn"
                    disabled={isGenerating}
                  >
                    {isGenerating ? <RefreshCw className="spin-icon" /> : <Sparkles />}
                    <span>{isGenerating ? 'Generating Free AI Story...' : 'Generate 5+ Min Episode Story'}</span>
                  </button>

                  <button
                    onClick={handleGenerate7DaySeries}
                    className="secondary-btn"
                    disabled={isGenerating}
                  >
                    <Calendar /> Batch Plan 7-Day Daily Series
                  </button>
                </div>
              </div>

              {/* Generated Story Display */}
              <div className="panel preview-panel">
                {currentEpisode ? (
                  <div>
                    <div className="episode-header-card">
                      <div className="ep-badge">EPISODE {currentEpisode.episodeNumber}</div>
                      <h2>{currentEpisode.title}</h2>
                      <p className="synopsis">{currentEpisode.synopsis}</p>

                      <div className="ep-meta-row">
                        <span><Clock className="icon-sm" /> Duration: ~{Math.round(currentEpisode.calculatedDurationSec / 60)} mins ({currentEpisode.calculatedDurationSec}s)</span>
                        <span><Heart className="icon-sm" /> Moral: {currentEpisode.outroMoral}</span>
                      </div>

                      <div className="quick-action-row">
                        <button onClick={() => setActiveTab('studio')} className="action-btn-primary">
                          <Film /> Open in 5+ Min Video Studio
                        </button>
                        <button onClick={() => setActiveTab('thumbnail')} className="action-btn-secondary">
                          <Image /> Create YouTube Thumbnail
                        </button>
                      </div>
                    </div>

                    <div className="scenes-preview-list">
                      <h3><BookOpen className="icon" /> Script & Scenes Breakdown ({currentEpisode.scenes.length} Scenes)</h3>

                      {currentEpisode.scenes.map((scene) => (
                        <div key={scene.id} className="scene-preview-card">
                          <div className="scene-top">
                            <h4>Scene {scene.id}: {scene.title}</h4>
                            <span className="duration">{scene.durationSec} sec</span>
                          </div>
                          <p className="narrative">{scene.narrativeScript}</p>
                          <div className="prompt-tag">🎨 Visual Prompt: {scene.visualPrompt}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Click "Generate 5+ Min Episode Story" to craft your first AI kid story!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'studio' && currentEpisode && (
          <VideoStudio episode={currentEpisode} />
        )}

        {activeTab === 'thumbnail' && currentEpisode && (
          <ThumbnailEditor episode={currentEpisode} />
        )}

        {activeTab === 'automation' && currentEpisode && (
          <YouTubeAutomation
            episode={currentEpisode}
            scheduleList={scheduleList}
            onAddScheduleItem={handleAddScheduleItem}
          />
        )}

        {activeTab === 'scheduler' && (
          <div className="scheduler-container">
            <div className="scheduler-header">
              <h2><Calendar className="icon" /> YouTube Daily Release Schedule</h2>
              <p className="subtitle">Manage daily releases, automated video production, and episode queue for maximum channel growth.</p>
            </div>

            <div className="schedule-table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Release Date</th>
                    <th>Episode</th>
                    <th>Series & Title</th>
                    <th>Theme</th>
                    <th>Target Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        No scheduled items. Return to AI Story Generator and click "Batch Plan 7-Day Daily Series".
                      </td>
                    </tr>
                  ) : (
                    scheduleList.map((item) => (
                      <tr key={item.id}>
                        <td className="font-bold">{item.date}</td>
                        <td>Ep {item.episodeNumber}</td>
                        <td>{item.episodeTitle}</td>
                        <td>{item.theme}</td>
                        <td>{item.targetDurationMin}:00 Min+</td>
                        <td>
                          <span className={`status-pill ${item.status}`}>{item.status.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
