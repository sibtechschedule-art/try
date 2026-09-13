export interface CharacterVoiceProfile {
  name: string;
  pitch: number;
  rate: number;
  voiceName?: string;
  color: string;
  avatarIcon: string;
  role: string;
}

export const BROADCAST_CHARACTER_PROFILES: Record<string, CharacterVoiceProfile> = {
  'Narrator': {
    name: 'Narrator',
    pitch: 1.0,
    rate: 0.95,
    color: '#facc15',
    avatarIcon: '✨',
    role: 'Storybook Host (Warm & Steady)'
  },
  'Leo': {
    name: 'Leo',
    pitch: 1.35,
    rate: 1.05,
    color: '#3b82f6',
    avatarIcon: '🦁',
    role: 'Brave Little Lion (Energetic)'
  },
  'Mia': {
    name: 'Mia',
    pitch: 1.5,
    rate: 1.0,
    color: '#ec4899',
    avatarIcon: '🦊',
    role: 'Smart & Curious Fox (Playful)'
  },
  'Pip Squirrel': {
    name: 'Pip Squirrel',
    pitch: 1.65,
    rate: 1.15,
    color: '#f59e0b',
    avatarIcon: '🐿️',
    role: 'Playful Little Squirrel (Quick)'
  },
  'Wise Owl': {
    name: 'Wise Owl',
    pitch: 0.8,
    rate: 0.85,
    color: '#8b5cf6',
    avatarIcon: '🦉',
    role: 'Gentle Old Forest Teacher (Calm & Deep)'
  },
  'Mama Squirrel': {
    name: 'Mama Squirrel',
    pitch: 1.25,
    rate: 0.95,
    color: '#10b981',
    avatarIcon: '🐿️',
    role: 'Kind Woodland Parent (Loving)'
  }
};

/**
 * Filters system voices for English-language packs to avoid foreign language misroutes.
 */
export function filterEnglishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  if (!voices || voices.length === 0) return [];

  // Filter for en-US, en-GB, en-AU, en-CA, en-IN, or lang starting with 'en'
  const englishVoices = voices.filter(v =>
    v.lang && (v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().includes('en-'))
  );

  return englishVoices.length > 0 ? englishVoices : voices;
}

/**
 * Selects the optimal browser voice for a specific character with multi-layer fallback.
 */
export function getOptimalVoiceForCharacter(
  characterName: string,
  profile: CharacterVoiceProfile,
  allVoices: SpeechSynthesisVoice[],
  globalVoiceName?: string
): { voice: SpeechSynthesisVoice | null; voiceSource: 'exact' | 'preferred-english' | 'fallback-english' | 'system-default' } {
  if (!allVoices || allVoices.length === 0) {
    return { voice: null, voiceSource: 'system-default' };
  }

  const englishVoices = filterEnglishVoices(allVoices);

  // 1. Try profile-specific voice name if specified
  if (profile.voiceName) {
    const exactMatch = allVoices.find(v => v.name === profile.voiceName);
    if (exactMatch) {
      return { voice: exactMatch, voiceSource: 'exact' };
    }
  }

  // 2. Try global preferred voice if specified and is English
  if (globalVoiceName) {
    const globalMatch = allVoices.find(v => v.name === globalVoiceName);
    if (globalMatch) {
      return { voice: globalMatch, voiceSource: 'exact' };
    }
  }

  // 3. Search for character-specific voice hint or high-quality natural voices (Google, Natural, Samantha, Daniel, Zira, Karen, Victoria)
  const highQualityMatch = englishVoices.find(v =>
    v.name.toLowerCase().includes(characterName.toLowerCase()) ||
    v.name.includes('Google') ||
    v.name.includes('Natural') ||
    v.name.includes('Samantha') ||
    v.name.includes('Daniel') ||
    v.name.includes('Zira') ||
    v.name.includes('Karen') ||
    v.name.includes('Victoria')
  );

  if (highQualityMatch) {
    return { voice: highQualityMatch, voiceSource: 'preferred-english' };
  }

  // 4. Fallback to any available English voice
  if (englishVoices.length > 0) {
    return { voice: englishVoices[0], voiceSource: 'fallback-english' };
  }

  // 5. Ultimate fallback to first system voice
  return { voice: allVoices[0] || null, voiceSource: 'system-default' };
}

/**
 * Configures SpeechSynthesisUtterance parameters with custom pitch/rate/voice per character.
 */
export function configureUtteranceForCharacter(
  utterance: SpeechSynthesisUtterance,
  characterName: string,
  profile: CharacterVoiceProfile,
  allVoices: SpeechSynthesisVoice[],
  masterPitch = 1.0,
  masterRate = 1.0,
  globalVoiceName?: string
): SpeechSynthesisVoice | null {
  const { voice } = getOptimalVoiceForCharacter(characterName, profile, allVoices, globalVoiceName);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || 'en-US';
  } else {
    utterance.lang = 'en-US';
  }

  // Apply character-specific pitch & rate scaled by master settings
  utterance.pitch = Math.max(0.5, Math.min(2.0, profile.pitch * masterPitch));
  utterance.rate = Math.max(0.5, Math.min(2.0, profile.rate * masterRate));

  return voice;
}
