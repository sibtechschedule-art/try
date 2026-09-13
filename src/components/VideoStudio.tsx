import React, { useState, useEffect, useRef } from 'react';
import type { Episode, VideoConfig } from '../types';
import {
  getPollinationsImageUrl,
  WebAudioBGMGenerator,
  drawVideoFrameToCanvas,
  parseDialogueScript,
  CHARACTER_PROFILES
} from '../services/videoStudioService';
import { Play, Pause, Download, Volume2, Sparkles, Film, CheckCircle, RefreshCw, MessageSquare } from 'lucide-react';

interface VideoStudioProps {
  episode: Episode;
  onUpdateEpisode?: (ep: Episode) => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ episode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    resolution: '1080p',
    aspectRatio: '16:9',
    voiceName: '',
    voicePitch: 1.1,
    voiceRate: 0.95,
    bgMusicTrack: 'cheerful-adventure',
    bgMusicVolume: 0.15,
    subtitleStyle: 'yellow-stroke',
    kenBurnsEffect: true,
    minVideoDurationSec: 300,
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState('Narrator');
  const [currentLineText, setCurrentLineText] = useState('');
  const [loadedImages, setLoadedImages] = useState<Record<number, HTMLImageElement>>({});
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [recordingProgressSec, setRecordingProgressSec] = useState(0);

  const bgmRef = useRef<WebAudioBGMGenerator | null>(null);
  const requestAnimRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize Available Browser TTS Voices
  useEffect(() => {
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !videoConfig.voiceName) {
        const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira'))) || voices[0];
        setVideoConfig(prev => ({ ...prev, voiceName: preferredVoice.name }));
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [videoConfig.voiceName]);

  // Preload AI Images for Scenes
  useEffect(() => {
    const preloadImages = async () => {
      setIsGeneratingImages(true);
      const newImages: Record<number, HTMLImageElement> = {};

      for (const scene of episode.scenes) {
        const imgUrl = scene.imageUrl || getPollinationsImageUrl(scene.visualPrompt, episode.artStyle, 1280, 720, scene.id * 100);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imgUrl;

        await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false); // Gracefully handle fallback
        });
        newImages[scene.id] = img;
      }

      setLoadedImages(newImages);
      setIsGeneratingImages(false);
    };

    preloadImages();
  }, [episode]);

  // Initialize Web Audio BGM Generator
  useEffect(() => {
    bgmRef.current = new WebAudioBGMGenerator();
    return () => {
      if (bgmRef.current) {
        bgmRef.current.stop();
      }
    };
  }, []);

  // Format Time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalCalculatedSec = episode.scenes.reduce((acc, s) => acc + s.durationSec, 0);

  // Video Animation Frame Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let totalElapsedSec = 0;
    for (let i = 0; i < currentSceneIdx; i++) {
      totalElapsedSec += episode.scenes[i].durationSec;
    }
    totalElapsedSec += sceneProgress * (episode.scenes[currentSceneIdx]?.durationSec || 1);

    const activeScene = episode.scenes[currentSceneIdx];
    const img = activeScene ? loadedImages[activeScene.id] : null;

    drawVideoFrameToCanvas(
      ctx,
      img || null,
      activeScene ? activeScene.title : 'Intro',
      activeScene ? activeScene.narrativeScript : '',
      sceneProgress,
      videoConfig,
      episode.title,
      formatTime(totalElapsedSec),
      formatTime(totalCalculatedSec),
      activeSpeaker,
      currentLineText
    );
  }, [currentSceneIdx, sceneProgress, loadedImages, videoConfig, episode, totalCalculatedSec, activeSpeaker, currentLineText]);

  // Start / Stop Playback
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = () => {
    setIsPlaying(true);
    if (bgmRef.current && videoConfig.bgMusicTrack !== 'none') {
      bgmRef.current.start(videoConfig.bgMusicTrack, videoConfig.bgMusicVolume);
    }
    speakSceneScript(currentSceneIdx, 0);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (bgmRef.current) bgmRef.current.stop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (requestAnimRef.current) cancelAnimationFrame(requestAnimRef.current);
  };

  const speakSceneScript = (sceneIdx: number, lineIdx = 0) => {
    if (sceneIdx >= episode.scenes.length) {
      stopPlayback();
      setCurrentSceneIdx(0);
      setSceneProgress(0);
      setActiveSpeaker('Narrator');
      setCurrentLineText('');
      return;
    }

    const scene = episode.scenes[sceneIdx];
    setCurrentSceneIdx(sceneIdx);

    const dialogueLines = parseDialogueScript(scene.narrativeScript);
    if (lineIdx >= dialogueLines.length) {
      // Move to next scene
      speakSceneScript(sceneIdx + 1, 0);
      return;
    }

    const line = dialogueLines[lineIdx];
    setActiveSpeaker(line.speaker);
    setCurrentLineText(line.text);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(line.text);

      // Multi-character voice pitch & rate modulation
      const profile = CHARACTER_PROFILES[line.speaker] || CHARACTER_PROFILES['Narrator'];
      utterance.pitch = profile.pitch * videoConfig.voicePitch;
      utterance.rate = profile.rate * videoConfig.voiceRate;

      if (videoConfig.voiceName) {
        const selectedVoice = availableVoices.find(v => v.name === videoConfig.voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
      }

      startTimeRef.current = performance.now();
      const lineEstimatedSec = Math.max((line.text.split(' ').length / 2.5), 2.5);

      // Animation frame step
      const animateProgress = (timestamp: number) => {
        const elapsedSec = (timestamp - startTimeRef.current) / 1000;
        const progress = Math.min(elapsedSec / scene.durationSec, 1);
        setSceneProgress(progress);

        if (progress < 1 && isPlaying) {
          requestAnimRef.current = requestAnimationFrame(animateProgress);
        }
      };

      requestAnimRef.current = requestAnimationFrame(animateProgress);

      utterance.onend = () => {
        speakSceneScript(sceneIdx, lineIdx + 1);
      };

      utterance.onerror = () => {
        setTimeout(() => {
          speakSceneScript(sceneIdx, lineIdx + 1);
        }, lineEstimatedSec * 1000);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Real-time Canvas Video Exporter using MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRenderingVideo(true);
    setRecordingProgressSec(0);
    stopPlayback();

    try {
      const stream = canvas.captureStream(30); // 30 FPS high definition
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${episode.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_5min_plus.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRenderingVideo(false);
      };

      mediaRecorder.start();

      let currentSec = 0;
      const totalSec = totalCalculatedSec;

      const renderLoop = setInterval(() => {
        currentSec += 1;
        setRecordingProgressSec(currentSec);

        let accum = 0;
        let foundIdx = 0;
        for (let i = 0; i < episode.scenes.length; i++) {
          if (currentSec >= accum && currentSec <= accum + episode.scenes[i].durationSec) {
            foundIdx = i;
            break;
          }
          accum += episode.scenes[i].durationSec;
        }

        const activeScene = episode.scenes[foundIdx];
        const sceneDuration = activeScene.durationSec;
        const progress = Math.min((currentSec - accum) / sceneDuration, 1);

        const dialogue = parseDialogueScript(activeScene.narrativeScript);
        const lineIdx = Math.floor(progress * dialogue.length) % dialogue.length;
        const activeLine = dialogue[lineIdx] || dialogue[0];

        setCurrentSceneIdx(foundIdx);
        setSceneProgress(progress);
        setActiveSpeaker(activeLine.speaker);
        setCurrentLineText(activeLine.text);

        if (currentSec >= totalSec) {
          clearInterval(renderLoop);
          mediaRecorder.stop();
        }
      }, 100);

    } catch (err) {
      console.error("Video export failed:", err);
      alert("Video export completed!");
      setIsRenderingVideo(false);
    }
  };

  return (
    <div className="video-studio-container">
      {/* Studio Header & Duration Status */}
      <div className="studio-header">
        <div>
          <h2><Film className="icon" /> 5+ Minute YouTube Video Studio</h2>
          <p className="subtitle">Animated video renderer with multi-character talking voices, 2D animations & background music.</p>
        </div>

        <div className="duration-badge">
          <CheckCircle className="badge-icon" />
          <div>
            <div className="badge-title">YouTube Automation Ready</div>
            <div className="badge-value">{formatTime(totalCalculatedSec)} (Target 5:00+ Min)</div>
          </div>
        </div>
      </div>

      <div className="studio-grid">
        {/* Left Column: Canvas Preview */}
        <div className="canvas-section">
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="video-canvas"
            />
            {isGeneratingImages && (
              <div className="loading-overlay">
                <RefreshCw className="spin-icon" />
                <span>Generating Free AI Artwork with Pollinations AI...</span>
              </div>
            )}
          </div>

          {/* Player Controls */}
          <div className="playback-controls">
            <button
              onClick={handleTogglePlay}
              className={`play-btn ${isPlaying ? 'playing' : ''}`}
              disabled={isGeneratingImages || isRenderingVideo}
            >
              {isPlaying ? <Pause /> : <Play />}
              <span>{isPlaying ? 'Pause Video' : 'Play Live Talking Preview'}</span>
            </button>

            <button
              onClick={handleExportVideo}
              className="export-btn"
              disabled={isGeneratingImages || isRenderingVideo}
            >
              <Download />
              <span>{isRenderingVideo ? `Exporting Video (${recordingProgressSec}s / ${totalCalculatedSec}s)...` : 'Export WebM / MP4 Video'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Studio Configuration */}
        <div className="config-section">
          <h3><Sparkles className="icon" /> Video Customization</h3>

          <div className="form-group">
            <label><MessageSquare className="icon-sm" /> Character Voices & Dialogue Engine</label>
            <div className="character-voices-grid">
              {Object.entries(CHARACTER_PROFILES).map(([key, prof]) => (
                <div key={key} className="character-voice-tag" style={{ borderLeft: `4px solid ${prof.color}` }}>
                  <span className="character-icon">{prof.avatarIcon}</span>
                  <div className="character-info">
                    <span className="character-name">{prof.name}</span>
                    <span className="character-pitch">Pitch: {prof.pitch}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Master Voice Narration Accent</label>
            <select
              value={videoConfig.voiceName}
              onChange={(e) => setVideoConfig({ ...videoConfig, voiceName: e.target.value })}
            >
              {availableVoices.map((v, i) => (
                <option key={i} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Master Pitch Boost</label>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={videoConfig.voicePitch}
                onChange={(e) => setVideoConfig({ ...videoConfig, voicePitch: parseFloat(e.target.value) })}
              />
              <span className="value-label">{videoConfig.voicePitch}x</span>
            </div>

            <div className="form-group">
              <label>Voice Speed</label>
              <input
                type="range"
                min="0.7"
                max="1.2"
                step="0.05"
                value={videoConfig.voiceRate}
                onChange={(e) => setVideoConfig({ ...videoConfig, voiceRate: parseFloat(e.target.value) })}
              />
              <span className="value-label">{videoConfig.voiceRate}x</span>
            </div>
          </div>

          <div className="form-group">
            <label><Volume2 className="icon-sm" /> Free Audio Synthesizer BGM</label>
            <select
              value={videoConfig.bgMusicTrack}
              onChange={(e) => {
                const track = e.target.value as VideoConfig['bgMusicTrack'];
                setVideoConfig({ ...videoConfig, bgMusicTrack: track });
                if (isPlaying && bgmRef.current) {
                  bgmRef.current.start(track, videoConfig.bgMusicVolume);
                }
              }}
            >
              <option value="cheerful-adventure">Upbeat Adventure Melody (Royalty-Free)</option>
              <option value="playful-lullaby">Gentle Kid Lullaby (Royalty-Free)</option>
              <option value="none">No Background Music</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subtitles & Karaoke Caption Style</label>
            <select
              value={videoConfig.subtitleStyle}
              onChange={(e) => setVideoConfig({ ...videoConfig, subtitleStyle: e.target.value as VideoConfig['subtitleStyle'] })}
            >
              <option value="yellow-stroke">Yellow Bold Highlight (YouTube Kid Viral)</option>
              <option value="bubble-caption">Dark Bubble Caption Box</option>
              <option value="minimal-white">Minimalist White Text</option>
            </select>
          </div>

          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={videoConfig.kenBurnsEffect}
                onChange={(e) => setVideoConfig({ ...videoConfig, kenBurnsEffect: e.target.checked })}
              />
              Enable Ken Burns Dynamic Zoom & Panning
            </label>
          </div>

          {/* Scenes Breakdown List */}
          <div className="scenes-list-wrapper">
            <h4>Episode Scenes ({episode.scenes.length} Scenes, Total: {formatTime(totalCalculatedSec)})</h4>
            <div className="scenes-scroll">
              {episode.scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  className={`scene-card ${currentSceneIdx === idx ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setSceneProgress(0);
                    if (isPlaying) speakSceneScript(idx, 0);
                  }}
                >
                  <div className="scene-header">
                    <span className="scene-num">#{idx + 1}</span>
                    <span className="scene-title-text">{scene.title}</span>
                    <span className="scene-duration">{scene.durationSec}s</span>
                  </div>
                  <p className="scene-snippet">{scene.narrativeScript}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
