import type { ArtStyle, VideoConfig, SubtitleStyle } from '../types';

/**
 * Returns a free AI generated image URL using Pollinations AI image service.
 */
export function getPollinationsImageUrl(prompt: string, artStyle: ArtStyle, width = 1280, height = 720, seed?: number): string {
  const styleKeywords: Record<ArtStyle, string> = {
    '3d-cartoon': '3d cartoon render, pixar disney style, vibrant colors, highly detailed, kid friendly',
    'disney-pixar': 'disney pixar animation style, 3d, beautiful lighting, adorable characters, masterpiece',
    'storybook-illustration': 'whimsical children book illustration, hand-drawn vector art, storybook, charming',
    'anime-kid': 'cute kid anime style, Studio Ghibli inspired, soft colors, heartwarming',
    'cute-water-color': 'soft watercolor painting, pastel tones, gentle artistic children storybook style'
  };

  const fullPrompt = `${prompt}, ${styleKeywords[artStyle] || styleKeywords['3d-cartoon']}, cute, safe for children, 8k resolution`;
  const cleanSeed = seed || Math.floor(Math.random() * 99999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${cleanSeed}&nologo=true`;
}

/**
 * Synthesizes background music loops directly using Web Audio API.
 * Ensures background music is 100% royalty-free, generated client-side with no external assets required.
 */
export class WebAudioBGMGenerator {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private masterGain: GainNode | null = null;

  start(style: string = 'cheerful-adventure', volume: number = 0.2) {
    if (this.isPlaying) this.stop();
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = Math.min(Math.max(volume, 0), 0.5);
      this.masterGain.connect(this.audioCtx.destination);
      this.isPlaying = true;

      const scale = style === 'playful-lullaby'
        ? [261.63, 293.66, 329.63, 392.00, 440.00] // C major pentatonic
        : [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale

      let step = 0;
      this.timer = window.setInterval(() => {
        if (!this.audioCtx || !this.isPlaying || !this.masterGain) return;
        const note = scale[step % scale.length];
        step++;

        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = style === 'playful-lullaby' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note, this.audioCtx.currentTime);

        noteGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.85);
      }, 400);
    } catch (e) {
      console.warn("Web Audio BGM not supported or blocked by user gesture:", e);
    }
  }

  setVolume(volume: number) {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 0.5), this.audioCtx.currentTime);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

/**
 * Draws animated video frame to HTML Canvas with Ken Burns effect and customizable subtitles.
 */
export function drawVideoFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  sceneTitle: string,
  text: string,
  progressRatio: number, // 0 to 1 over current scene duration
  videoConfig: VideoConfig,
  episodeTitle: string,
  currentTimeFormatted: string,
  totalTimeFormatted: string
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Clear background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    if (videoConfig.kenBurnsEffect) {
      // Ken Burns smooth pan and zoom
      const zoom = 1.0 + 0.08 * Math.sin(progressRatio * Math.PI);
      const panX = (progressRatio - 0.5) * 20;
      const panY = (progressRatio - 0.5) * 10;

      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }
    ctx.restore();
  } else {
    // Fallback gradient while loading
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#312e81');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("✨ Generating AI Scene Artwork...", width / 2, height / 2);
  }

  // Top Title Bar Overlay
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(0, 0, width, 70);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🎬 ${episodeTitle}`, 24, 42);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${currentTimeFormatted} / ${totalTimeFormatted}`, width - 24, 42);

  // Scene Badge
  ctx.fillStyle = 'rgba(238, 242, 255, 0.9)';
  ctx.fillRect(24, height - 160, sceneTitle.length * 12 + 30, 36);
  ctx.fillStyle = '#312e81';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(sceneTitle, 36, height - 136);

  // Subtitle Overlay Box
  drawSubtitles(ctx, text, videoConfig.subtitleStyle, width, height);

  // Bottom Progress Bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, height - 8, width, 8);

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, height - 8, width * progressRatio, 8);
}

function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  text: string,
  style: SubtitleStyle,
  width: number,
  height: number
) {
  if (!text) return;

  const padding = 20;
  const maxTextWidth = width - 120;
  ctx.font = 'bold 30px sans-serif';

  // Word wrapping
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxTextWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = 40;
  const boxHeight = lines.length * lineHeight + padding * 2;
  const boxY = height - 110 - (lines.length - 1) * lineHeight;

  if (style === 'bubble-caption') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(40, boxY - 10, width - 80, boxHeight, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, boxY + padding + idx * lineHeight);
    });
  } else if (style === 'yellow-stroke') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, boxY - 15, width, boxHeight + 10);

    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillStyle = '#fde047'; // Bright Yellow

    lines.forEach((line, idx) => {
      const lineY = boxY + padding + idx * lineHeight;
      ctx.strokeText(line, width / 2, lineY);
      ctx.fillText(line, width / 2, lineY);
    });
  } else {
    // Minimal White
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, boxY - 10, width - 40, boxHeight);

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, boxY + padding + idx * lineHeight);
    });
  }
}
