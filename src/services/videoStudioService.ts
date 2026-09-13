import type { ArtStyle, VideoConfig, SubtitleStyle } from '../types';
import {
  BROADCAST_CHARACTER_PROFILES,
  type CharacterVoiceProfile
} from './speechSynthesisService';

export type { CharacterVoiceProfile };
export const DEFAULT_CHARACTER_PROFILES = BROADCAST_CHARACTER_PROFILES;

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
 * Draws high-definition animated video frame with procedural scene graphics,
 * vibrant kid-friendly scene borders, and broadcast-ready expressive character containers
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

  // 3. Render Vibrant Expressive Character Art Containers & Active Speaker Highlights
  const speakerCoords = drawExpressiveCharacterSprites(ctx, width, height, activeSpeaker, time, progressRatio, customCharacterProfiles);

  // 4. Top Header Overlay Bar with Broadcast Branding
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(0, 0, width, 68);

  // Decorative Accent Bar under Header
  const activeProfile = customCharacterProfiles[activeSpeaker] || DEFAULT_CHARACTER_PROFILES['Narrator'];
  ctx.fillStyle = activeProfile?.color || '#facc15';
  ctx.fillRect(0, 65, width, 3);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🎬 ${episodeTitle}`, 24, 40);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${currentTimeFormatted} / ${totalTimeFormatted}`, width - 24, 40);

  // 5. Active Speaker Speech Bubble & Dialogue Subtitles
  const lineToDraw = currentLineText || fullText;
  drawSubtitlesAndSpeaker(ctx, lineToDraw, activeSpeaker, videoConfig.subtitleStyle, width, height, customCharacterProfiles, speakerCoords);

  // 6. Kid-Friendly Outer Border Framing & Star Corner Accents
  drawKidFriendlySceneFrame(ctx, width, height, time);

  // 7. Bottom Scene Progress Bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, height - 8, width, 8);

  ctx.fillStyle = activeProfile?.color || '#3b82f6';
  ctx.fillRect(0, height - 8, width * progressRatio, 8);
}

/**
 * Kid-friendly decorative border framing with sparkling corner badges
 */
function drawKidFriendlySceneFrame(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  // Corner Star Accents
  const corners = [
    { x: 20, y: 20 },
    { x: width - 20, y: 20 },
    { x: 20, y: height - 20 },
    { x: width - 20, y: height - 20 }
  ];

  for (const c of corners) {
    const scale = 0.8 + Math.sin(time * 4) * 0.2;
    ctx.fillStyle = '#facc15';
    ctx.font = `${Math.floor(20 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', c.x, c.y);
  }

  ctx.restore();
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
 * Vibrant Expressive Character Art Containers with active speaker pulsing highlights, mouth animations, and position tracking
 */
function drawExpressiveCharacterSprites(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activeSpeaker: string,
  time: number,
  progress: number,
  profiles: Record<string, CharacterVoiceProfile>
): { x: number; y: number } | null {
  const characterList = [
    { key: 'Leo', defaultX: width * 0.2, defaultY: height - 250 },
    { key: 'Mia', defaultX: width * 0.4, defaultY: height - 245 },
    { key: 'Pip Squirrel', defaultX: width * 0.6, defaultY: height - 235 },
    { key: 'Wise Owl', defaultX: width * 0.8, defaultY: height - 290 }
  ];

  let activeSpeakerCoords: { x: number; y: number } | null = null;

  for (const charItem of characterList) {
    const prof = profiles[charItem.key] || DEFAULT_CHARACTER_PROFILES[charItem.key] || DEFAULT_CHARACTER_PROFILES['Narrator'];
    const isSpeaking = activeSpeaker.toLowerCase().includes(charItem.key.toLowerCase());

    // Movement & Talking bounce
    const bounceY = isSpeaking ? Math.abs(Math.sin(time * 10)) * 28 : Math.sin(time * 2.5 + charItem.defaultX) * 8;
    const walkX = charItem.defaultX + Math.sin(progress * Math.PI * 2) * 20;
    const cardY = charItem.defaultY - bounceY;

    if (isSpeaking) {
      activeSpeakerCoords = { x: walkX, y: cardY };
    }

    ctx.save();
    ctx.translate(walkX, cardY);

    const cardWidth = 145;
    const cardHeight = 165;

    // Vibrant Pulsing Speaker Glow / Ring
    if (isSpeaking) {
      const pulseSize = 10 + Math.sin(time * 12) * 6;
      ctx.shadowColor = prof.color;
      ctx.shadowBlur = 30;
      ctx.fillStyle = prof.color;
      ctx.beginPath();
      ctx.roundRect(-cardWidth / 2 - pulseSize, -cardHeight / 2 - pulseSize, cardWidth + pulseSize * 2, cardHeight + pulseSize * 2, 28);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Expressive Character Art Container
    ctx.fillStyle = isSpeaking ? '#ffffff' : 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = isSpeaking ? prof.color : 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = isSpeaking ? 5 : 2;
    ctx.beginPath();
    ctx.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 22);
    ctx.fill();
    ctx.stroke();

    // Vibrant Top Banner Frame
    ctx.fillStyle = prof.color;
    ctx.beginPath();
    ctx.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, 34, [22, 22, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(prof.name, 0, -cardHeight / 2 + 23);

    // Large Character Emoji Avatar Sprite
    ctx.font = isSpeaking ? '58px sans-serif' : '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prof.avatarIcon, 0, -8);

    // Talking Mouth Animation & Facial Expression
    if (isSpeaking) {
      const mouthOpen = Math.abs(Math.sin(time * 12)) * 12;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(0, 24, 11, Math.max(3, mouthOpen), 0, 0, Math.PI * 2);
      ctx.fill();

      // Speech Indicator Badge Above Head
      ctx.fillStyle = prof.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.beginPath();
      ctx.roundRect(-50, -cardHeight / 2 - 34, 100, 26, 13);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText('🗣️ SPEAKING', 0, -cardHeight / 2 - 17);
    } else {
      // Gentle Smile line
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 20, 8, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    // Role Badge Footer
    ctx.fillStyle = '#475569';
    ctx.font = '11px sans-serif';
    ctx.fillText(prof.role.split(' ')[0], 0, cardHeight / 2 - 12);

    ctx.restore();
  }

  return activeSpeakerCoords;
}

/**
 * Subtitles with Active Speaker Tag & Speech Bubble Tail pointing from active speaker
 */
function drawSubtitlesAndSpeaker(
  ctx: CanvasRenderingContext2D,
  text: string,
  speaker: string,
  style: SubtitleStyle,
  width: number,
  height: number,
  profiles: Record<string, CharacterVoiceProfile>,
  speakerCoords: { x: number; y: number } | null
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

  // Speech Bubble Pointer Tail (pointing from speaker location to dialogue container)
  if (speakerCoords && style === 'bubble-caption') {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.moveTo(speakerCoords.x, boxY);
    ctx.lineTo(speakerCoords.x - 20, boxY - 25);
    ctx.lineTo(speakerCoords.x + 20, boxY - 25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Speaker Badge Title Box
  ctx.fillStyle = profile.color;
  ctx.beginPath();
  ctx.roundRect(50, boxY - 36, 240, 40, 14);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${profile.avatarIcon} ${speaker} (${profile.role.split(' ')[0]})`, 170, boxY - 11);

  // Subtitle Container Box
  ctx.font = 'bold 28px sans-serif';
  if (style === 'bubble-caption') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(40, boxY, width - 80, boxHeight, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, boxY + padding + 22 + idx * lineHeight);
    });
  } else if (style === 'yellow-stroke') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(20, boxY, width - 40, boxHeight);

    ctx.fillStyle = '#f8fafc';
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, boxY + padding + 22 + idx * lineHeight);
    });
  }
}
