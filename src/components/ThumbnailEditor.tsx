import React, { useState, useEffect, useRef } from 'react';
import type { Episode, ThumbnailConfig } from '../types';
import { getPollinationsImageUrl } from '../services/videoStudioService';
import { Image, Download, Sparkles, Type, Palette } from 'lucide-react';

interface ThumbnailEditorProps {
  episode: Episode;
}

export const ThumbnailEditor: React.FC<ThumbnailEditorProps> = ({ episode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [config, setConfig] = useState<ThumbnailConfig>({
    title: episode.title,
    subtitle: episode.seriesTitle,
    episodeBadge: `EPISODE ${episode.episodeNumber}`,
    themeColor: '#facc15', // Bright yellow
    bgImageUrl: episode.scenes[0]?.imageUrl || getPollinationsImageUrl(episode.scenes[0]?.visualPrompt || episode.title, episode.artStyle, 1280, 720, 999),
    fontSize: 54,
    sticker: 'star'
  });

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Load Background Image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = config.bgImageUrl;
    img.onload = () => setBgImage(img);
  }, [config.bgImageUrl]);

  // Render Thumbnail Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1280, 720);

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, 1280, 720);
    }

    // Gradient Overlay for contrast
    const grad = ctx.createLinearGradient(0, 360, 0, 720);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Episode Badge Top Left
    ctx.fillStyle = config.themeColor;
    ctx.beginPath();
    ctx.roundRect(40, 40, 240, 60, 16);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'black 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.episodeBadge, 160, 80);

    // Sticker Badge Top Right
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(1200, 70, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    const stickerEmoji = {
      star: '⭐',
      crown: '👑',
      fire: '🔥',
      heart: '💖',
      magic: '✨'
    }[config.sticker];
    ctx.fillText(stickerEmoji, 1200, 82);

    // Main Title Bottom Center with Yellow Stroke & Shadow
    ctx.textAlign = 'center';
    ctx.font = `black ${config.fontSize}px sans-serif`;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillText(config.title, 644, 614);

    // Stroke
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.strokeText(config.title, 640, 610);

    // Fill Color
    ctx.fillStyle = config.themeColor;
    ctx.fillText(config.title, 640, 610);

    // Subtitle Tagline
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`🌟 Daily Kids Story Series - ${config.subtitle}`, 640, 660);

  }, [config, bgImage]);

  // Download Thumbnail
  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube_thumbnail_ep${episode.episodeNumber}.png`;
    a.click();
  };

  return (
    <div className="thumbnail-editor-container">
      <div className="editor-header">
        <h2><Image className="icon" /> YouTube High-CTR Thumbnail Studio</h2>
        <p className="subtitle">Design eye-catching 1280x720 thumbnails with AI backgrounds and kid-friendly title badges.</p>
      </div>

      <div className="thumbnail-grid">
        {/* Canvas Display */}
        <div className="thumbnail-preview-section">
          <div className="thumbnail-canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="thumbnail-canvas"
            />
          </div>

          <button onClick={handleDownloadThumbnail} className="download-btn-lg">
            <Download /> Export YouTube Thumbnail (1280x720 PNG)
          </button>
        </div>

        {/* Thumbnail Customization Controls */}
        <div className="thumbnail-controls-section">
          <h3><Sparkles className="icon" /> Customize Visuals</h3>

          <div className="form-group">
            <label><Type className="icon-sm" /> Thumbnail Main Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Episode Badge Text</label>
            <input
              type="text"
              value={config.episodeBadge}
              onChange={(e) => setConfig({ ...config, episodeBadge: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><Palette className="icon-sm" /> Accent Badge Color</label>
            <div className="color-presets">
              {['#facc15', '#38bdf8', '#f43f5e', '#a855f7', '#4ade80'].map((color) => (
                <button
                  key={color}
                  className={`color-swatch ${config.themeColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setConfig({ ...config, themeColor: color })}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Badge Sticker Icon</label>
            <select
              value={config.sticker}
              onChange={(e) => setConfig({ ...config, sticker: e.target.value as ThumbnailConfig['sticker'] })}
            >
              <option value="star">⭐ Golden Star</option>
              <option value="crown">👑 Magic Crown</option>
              <option value="fire">🔥 Hot Trending</option>
              <option value="heart">💖 Love & Kindness</option>
              <option value="magic">✨ Sparks & Wonders</option>
            </select>
          </div>

          <div className="form-group">
            <label>Background Scene</label>
            <select
              value={config.bgImageUrl}
              onChange={(e) => setConfig({ ...config, bgImageUrl: e.target.value })}
            >
              {episode.scenes.map((s, idx) => {
                const url = s.imageUrl || getPollinationsImageUrl(s.visualPrompt, episode.artStyle, 1280, 720, s.id * 100);
                return (
                  <option key={s.id} value={url}>
                    Scene {idx + 1}: {s.title}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
