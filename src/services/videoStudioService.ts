import type { ArtStyle, VideoConfig, SubtitleStyle } from '../types';

/**
 * Returns a free AI generated image URL using Pollinations AI image service.
 */
export function getPollinationsImageUrl(prompt: string, artStyle: ArtStyle, width = 1280, height = 720, seed?: number): string {
  const styleKeywords: Record<ArtStyle, string> = {
    '3d-cartoon': '3d cartoon, pixar style, vibrant',
    'disney-pixar': 'disney pixar 3d animation, cute',
    'storybook-illustration': 'children storybook illustration, cute',
    'anime-kid': 'cute ghibli anime style',
    'cute-water-color': 'soft watercolor children book art'
  };

  const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ,.-]/g, '').slice(0, 150);
  const fullPrompt = `${cleanPrompt}, ${styleKeywords[artStyle] || styleKeywords['3d-cartoon']}, cute for kids`;
  const cleanSeed = seed || Math.floor(Math.random() * 99999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${cleanSeed}&nologo=true`;
}

/**
 * Web Audio BGM Generator - 100% royalty-free synthesized music
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

        noteGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.85);
      }, 400);
    } catch (e) {
      console.warn("Web Audio BGM error:", e);
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
 * Character voice profiles for multi-character dialogue
 */
export interface CharacterVoiceProfile {
  name: string;
  pitch: number;
  rate: number;
  voiceName?: string;
  color: string;
  avatarIcon: string;
  role: string;
}

export const DEFAULT_CHARACTER_PROFILES: Record<string, CharacterVoiceProfile> = {
  'Leo': { name: 'Leo', pitch: 1.35, rate: 1.05, color: '#3b82f6', avatarIcon: '🦁', role: 'Brave Little Lion Explorer' },
  'Mia': { name: 'Mia', pitch: 1.5, rate: 1.0, color: '#ec4899', avatarIcon: '🦊', role: 'Smart & Curious Fox' },
  'Pip Squirrel': { name: 'Pip Squirrel', pitch: 1.65, rate: 1.15, color: '#f59e0b', avatarIcon: '🐿️', role: 'Playful Little Squirrel' },
  'Wise Owl': { name: 'Wise Owl', pitch: 0.8, rate: 0.85, color: '#8b5cf6', avatarIcon: '🦉', role: 'Gentle Old Forest Teacher' },
  'Mama Squirrel': { name: 'Mama Squirrel', pitch: 1.25, rate: 0.95, color: '#10b981', avatarIcon: '🐿️', role: 'Kind Woodland Parent' },
  'Narrator': { name: 'Narrator', pitch: 1.0, rate: 0.95, color: '#facc15', avatarIcon: '✨', role: 'Storybook Host' }
};

/**
 * Parses multi-line script into speaker dialogues
 */
export interface DialogueLine {
  speaker: string;
  text: string;
}

export function parseDialogueScript(rawScript: string): DialogueLine[] {
  const lines = rawScript.split('\n').map(l => l.trim()).filter(Boolean);
  const parsed: DialogueLine[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx < 20) {
      const speaker = line.substring(0, colonIdx).trim();
      const text = line.substring(colonIdx + 1).trim();
      parsed.push({ speaker, text });
    } else {
      parsed.push({ speaker: 'Narrator', text: line });
    }
  }

  return parsed.length > 0 ? parsed : [{ speaker: 'Narrator', text: rawScript }];
}

/**
 * Draws high-definition animated video frame with procedural scene graphics & expressive character sprite cards
 */
export function drawVideoFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  sceneTitle: string,
  fullText: string,
  progressRatio: number, // 0 to 1 over scene
  videoConfig: VideoConfig,
  episodeTitle: string,
  currentTimeFormatted: string,
  totalTimeFormatted: string,
  activeSpeaker: string = 'Narrator',
  currentLineText: string = '',
  customCharacterProfiles: Record<string, CharacterVoiceProfile> = DEFAULT_CHARACTER_PROFILES
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const time = performance.now() / 1000;

  // 1. Draw Background Visual (Image or Rich Animated Procedural Landscape)
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    if (videoConfig.kenBurnsEffect) {
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
    // Instant Procedural 2D Animated Scene Fallback (Zero missing visuals)
    drawProceduralSceneBackground(ctx, width, height, sceneTitle, progressRatio, time);
  }

  // 2. Continuous Motion Effects (Floating Stars, Drifting Clouds, Magic Particles)
  drawMovingVectorEffects(ctx, width, height, time);

  // 3. Render Expressive Character Sprites / Cards on Screen
  drawExpressiveCharacterSprites(ctx, width, height, activeSpeaker, time, progressRatio, customCharacterProfiles);

  // 4. Top Overlay Bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, width, 65);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🎬 ${episodeTitle}`, 24, 40);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${currentTimeFormatted} / ${totalTimeFormatted}`, width - 24, 40);

  // 5. Active Speaker Badge & Dialogue Subtitles
  const lineToDraw = currentLineText || fullText;
  drawSubtitlesAndSpeaker(ctx, lineToDraw, activeSpeaker, videoConfig.subtitleStyle, width, height, customCharacterProfiles);

  // 6. Bottom Scene Progress Bar
  const activeProfile = customCharacterProfiles[activeSpeaker] || DEFAULT_CHARACTER_PROFILES['Narrator'];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, height - 8, width, 8);

  ctx.fillStyle = activeProfile?.color || '#3b82f6';
  ctx.fillRect(0, height - 8, width * progressRatio, 8);
}

/**
 * Renders procedural colorful 2D animated background scenes
 */
function drawProceduralSceneBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sceneTitle: string,
  progress: number,
  time: number
) {
  const isNight = sceneTitle.toLowerCase().includes('night') || sceneTitle.toLowerCase().includes('star');

  if (isNight) {
    // Night Sky
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#311b92');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Moon
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(width - 150, 140, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Bright Sunny Sky
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.6, '#bae6fd');
    grad.addColorStop(1, '#86efac');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Sun with glowing rays
    const sunX = 150 + Math.sin(time * 0.5) * 20;
    const sunY = 120;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 55, 0, Math.PI * 2);
    ctx.fill();

    // Drifting Clouds
    drawCloud(ctx, (time * 30) % (width + 200) - 100, 100, 1.2);
    drawCloud(ctx, ((time * 20) + 400) % (width + 200) - 100, 160, 0.9);
  }

  // Rolling Green Hills with Parallax
  const hillOffset = Math.sin(progress * Math.PI) * 30;
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.quadraticCurveTo(width * 0.3, height - 210 + hillOffset, width * 0.6, height - 150);
  ctx.quadraticCurveTo(width * 0.85, height - 100, width, height);
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.quadraticCurveTo(width * 0.25, height - 150, width * 0.5, height - 220 + hillOffset);
  ctx.quadraticCurveTo(width * 0.75, height - 260, width, height);
  ctx.fill();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.arc(25, -15, 35, 0, Math.PI * 2);
  ctx.arc(55, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Continuous animated particles (stars, magic sparkles)
 */
function drawMovingVectorEffects(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.save();
  for (let i = 0; i < 25; i++) {
    const x = (Math.sin(i * 99 + time * 0.5) * 0.5 + 0.5) * width;
    const y = ((i * 35 + time * 20) % (height - 180)) + 60;
    const alpha = Math.sin(time * 3 + i) * 0.5 + 0.5;
    const size = 3 + (i % 4);

    ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Expressive character sprite card frames with talking mouth animation, eyes, speech bubbles, and bounce motion
 */
function drawExpressiveCharacterSprites(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activeSpeaker: string,
  time: number,
  progress: number,
  profiles: Record<string, CharacterVoiceProfile>
) {
  const characterList = [
    { key: 'Leo', defaultX: width * 0.2, defaultY: height - 250 },
    { key: 'Mia', defaultX: width * 0.4, defaultY: height - 245 },
    { key: 'Pip Squirrel', defaultX: width * 0.6, defaultY: height - 235 },
    { key: 'Wise Owl', defaultX: width * 0.8, defaultY: height - 290 }
  ];

  for (const charItem of characterList) {
    const prof = profiles[charItem.key] || DEFAULT_CHARACTER_PROFILES[charItem.key] || DEFAULT_CHARACTER_PROFILES['Narrator'];
    const isSpeaking = activeSpeaker.toLowerCase().includes(charItem.key.toLowerCase());

    // Movement & Talking bounce
    const bounceY = isSpeaking ? Math.abs(Math.sin(time * 10)) * 28 : Math.sin(time * 2.5 + charItem.defaultX) * 8;
    const walkX = charItem.defaultX + Math.sin(progress * Math.PI * 2) * 20;
    const cardY = charItem.defaultY - bounceY;

    ctx.save();
    ctx.translate(walkX, cardY);

    const cardWidth = 140;
    const cardHeight = 160;

    // Glowing Aura for Active Speaker
    if (isSpeaking) {
      ctx.shadowColor = prof.color;
      ctx.shadowBlur = 25;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(-cardWidth / 2 - 10, -cardHeight / 2 - 10, cardWidth + 20, cardHeight + 20, 24);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Expressive Card Background
    ctx.fillStyle = isSpeaking ? '#ffffff' : 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = isSpeaking ? prof.color : 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = isSpeaking ? 5 : 2;
    ctx.beginPath();
    ctx.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 20);
    ctx.fill();
    ctx.stroke();

    // Top Header Banner on Card
    ctx.fillStyle = prof.color;
    ctx.beginPath();
    ctx.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, 32, [20, 20, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(prof.name, 0, -cardHeight / 2 + 22);

    // Character Emoji Avatar Sprite
    ctx.font = isSpeaking ? '56px sans-serif' : '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prof.avatarIcon, 0, -10);

    // Animated Mouth Indicator / Talking Wave Effect
    if (isSpeaking) {
      const mouthOpen = Math.abs(Math.sin(time * 12)) * 12;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(0, 22, 10, Math.max(3, mouthOpen), 0, 0, Math.PI * 2);
      ctx.fill();

      // Speech Indicator Popup
      ctx.fillStyle = prof.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.beginPath();
      ctx.roundRect(-45, -cardHeight / 2 - 32, 90, 24, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText('🗣️ SPEAKING', 0, -cardHeight / 2 - 16);
    } else {
      // Gentle Smile line
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 18, 8, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    // Role Subtitle Label
    ctx.fillStyle = '#475569';
    ctx.font = '11px sans-serif';
    ctx.fillText(prof.role.split(' ')[0], 0, cardHeight / 2 - 12);

    ctx.restore();
  }
}

/**
 * Subtitles with Active Speaker Tag & Styling
 */
function drawSubtitlesAndSpeaker(
  ctx: CanvasRenderingContext2D,
  text: string,
  speaker: string,
  style: SubtitleStyle,
  width: number,
  height: number,
  profiles: Record<string, CharacterVoiceProfile>
) {
  if (!text) return;

  const profile = profiles[speaker] || DEFAULT_CHARACTER_PROFILES[speaker] || DEFAULT_CHARACTER_PROFILES['Narrator'];
  const padding = 20;
  const maxTextWidth = width - 140;
  ctx.font = 'bold 28px sans-serif';

  // Word wrap
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

  const lineHeight = 38;
  const boxHeight = lines.length * lineHeight + padding * 2 + 25;
  const boxY = height - 125 - (lines.length - 1) * lineHeight;

  // Speaker Badge Title Box
  ctx.fillStyle = profile.color;
  ctx.beginPath();
  ctx.roundRect(50, boxY - 34, 220, 38, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${profile.avatarIcon} ${speaker} (${profile.role.split(' ')[0]})`, 160, boxY - 10);

  // Subtitle Container Box
  ctx.font = 'bold 28px sans-serif';
  if (style === 'bubble-caption') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(40, boxY, width - 80, boxHeight, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, boxY + padding + 22 + idx * lineHeight);
    });
  } else if (style === 'yellow-stroke') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, boxY - 5, width, boxHeight + 10);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillStyle = '#fde047'; // Bright Yellow

    lines.forEach((line, idx) => {
      const lineY = boxY + padding + 22 + idx * lineHeight;
      ctx.strokeText(line, width / 2, lineY);
      ctx.fillText(line, width / 2, lineY);
    });
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(20, boxY, width - 40, boxHeight);

    ctx.fillStyle = '#f8fafc';
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, boxY + padding + 22 + idx * lineHeight);
    });
  }
}
