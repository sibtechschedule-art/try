export type AgeGroup = '3-5' | '6-8' | '9-12';

export type ArtStyle =
  | '3d-cartoon'
  | 'disney-pixar'
  | 'storybook-illustration'
  | 'anime-kid'
  | 'cute-water-color';

export type BgMusicTrack =
  | 'cheerful-adventure'
  | 'playful-lullaby'
  | 'magical-fairytale'
  | 'upbeat-fun'
  | 'none';

export type SubtitleStyle = 'yellow-stroke' | 'bubble-caption' | 'minimal-white';

export interface Scene {
  id: number;
  title: string;
  visualPrompt: string;
  narrativeScript: string;
  durationSec: number;
  moralInsight?: string;
  interactiveQuestion?: string;
  imageUrl?: string;
}

export interface YouTubeMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  chapters: { time: string; title: string }[];
  madeForKids: boolean;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seriesTitle: string;
  title: string;
  theme: string;
  ageGroup: AgeGroup;
  artStyle: ArtStyle;
  synopsis: string;
  targetDurationSec: number; // e.g. 300 (5 minutes minimum)
  calculatedDurationSec: number;
  scenes: Scene[];
  outroMoral: string;
  quizQuestions: { question: string; options: string[]; answer: string }[];
  youtubeMetadata?: YouTubeMetadata;
  createdAt: string;
}

export interface VideoConfig {
  resolution: '1080p' | '720p';
  aspectRatio: '16:9' | '9:16';
  voiceName: string;
  voicePitch: number;
  voiceRate: number;
  bgMusicTrack: BgMusicTrack;
  bgMusicVolume: number;
  subtitleStyle: SubtitleStyle;
  kenBurnsEffect: boolean;
  minVideoDurationSec: number; // strictly defaults to 300 (5 mins)
}

export interface ThumbnailConfig {
  title: string;
  subtitle: string;
  episodeBadge: string;
  themeColor: string;
  bgImageUrl: string;
  fontSize: number;
  sticker: 'star' | 'crown' | 'fire' | 'heart' | 'magic';
}

export interface DailyScheduleItem {
  id: string;
  date: string;
  episodeNumber: number;
  seriesTitle: string;
  episodeTitle: string;
  status: 'planned' | 'generated' | 'exported' | 'published';
  targetDurationMin: number;
  theme: string;
  notes?: string;
}
