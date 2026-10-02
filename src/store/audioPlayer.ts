import { create } from 'zustand';
import type { LanguageCode } from '@/types';
import { useGamification } from './gamification';
import { toast } from './toasts';

export interface SpokenStory {
  id: string;
  title: string;
  body: string;
  athleteName?: string;
  language: LanguageCode;
}

interface AudioPlayerState {
  currentStory: SpokenStory | null;
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceUri: string | null;
  progress: number; // 0 to 100
  speechError: string | null;

  // Actions
  playStory: (story: SpokenStory) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setVoiceUri: (uri: string) => void;
  refreshVoices: () => void;
}

// Map app LanguageCode to BCP-47 language tags for Web Speech
const LANG_MAP: Record<LanguageCode, string[]> = {
  en: ['en-GB', 'en-US', 'en-IN', 'en-AU', 'en-NZ', 'en'],
  hi: ['hi-IN', 'hi'],
  ta: ['ta-IN', 'ta-LK', 'ta'],
  ar: ['ar-SA', 'ar-AE', 'ar-EG', 'ar'],
  es: ['es-ES', 'es-MX', 'es'],
  bn: ['bn-BD', 'bn-IN', 'bn'],
};

let progressInterval: number | null = null;

export const useAudioPlayer = create<AudioPlayerState>((set, get) => ({
  currentStory: null,
  isPlaying: false,
  isPaused: false,
  rate: 1.0,
  availableVoices: [],
  selectedVoiceUri: null,
  progress: 0,
  speechError: null,

  refreshVoices: () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    set({ availableVoices: voices });
  },

  playStory: (story: SpokenStory) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.warn('Audio recap unavailable', 'Web Speech API is not supported in this browser.');
      return;
    }

    const { stop, rate, selectedVoiceUri, availableVoices } = get();
    stop();

    const fullText = `${story.title}. By Beyond the Crease. ${story.body}`;
    const utterance = new SpeechSynthesisUtterance(fullText);

    // Language-aware voice selection
    const prefLangs = LANG_MAP[story.language] ?? ['en'];
    let chosenVoice: SpeechSynthesisVoice | undefined;

    if (selectedVoiceUri) {
      chosenVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);
    }
    if (!chosenVoice) {
      chosenVoice = availableVoices.find((v) =>
        prefLangs.some((langPrefix) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())),
      );
    }
    if (!chosenVoice && availableVoices.length > 0) {
      chosenVoice = availableVoices.find((v) => v.lang.startsWith('en')) ?? availableVoices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    }

    utterance.rate = rate;
    utterance.pitch = 1.0;

    let charIndex = 0;
    const totalChars = fullText.length;

    utterance.onboundary = (e) => {
      if (e.charIndex !== undefined) {
        charIndex = e.charIndex;
        const pct = Math.min(100, Math.round((charIndex / Math.max(1, totalChars)) * 100));
        set({ progress: pct });
      }
    };

    utterance.onstart = () => {
      set({ isPlaying: true, isPaused: false, currentStory: story, speechError: null, progress: 0 });
      useGamification.getState().award('b-first-read');
      toast.info('Audio recap started', `Listening to "${story.title.slice(0, 35)}..."`);
    };

    utterance.onend = () => {
      set({ isPlaying: false, isPaused: false, progress: 100 });
      if (progressInterval) clearInterval(progressInterval);
      toast.success('Recap finished', 'Story listening recorded.');
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        set({ speechError: e.error, isPlaying: false, isPaused: false });
        toast.warn('Audio playback error', `Playback stopped: ${e.error}`);
      }
      if (progressInterval) clearInterval(progressInterval);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    // Fallback progress estimate if onboundary isn't supported by browser engine
    const estimatedDurationSecs = (totalChars / 15) / rate;
    const startTs = Date.now();
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = window.setInterval(() => {
      const elapsed = (Date.now() - startTs) / 1000;
      const pct = Math.min(99, Math.round((elapsed / Math.max(1, estimatedDurationSecs)) * 100));
      set((s) => (s.isPlaying && !s.isPaused ? { progress: Math.max(s.progress, pct) } : s));
    }, 500);
  },

  pause: () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      set({ isPaused: true, isPlaying: false });
    }
  },

  resume: () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      set({ isPaused: false, isPlaying: true });
    }
  },

  stop: () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    set({ isPlaying: false, isPaused: false, currentStory: null, progress: 0 });
  },

  setRate: (rate: number) => {
    set({ rate });
    const { currentStory, isPlaying } = get();
    if (currentStory && isPlaying) {
      // Re-trigger with new rate seamlessly
      get().playStory(currentStory);
    }
  },

  setVoiceUri: (uri: string) => {
    set({ selectedVoiceUri: uri });
    const { currentStory, isPlaying } = get();
    if (currentStory && isPlaying) {
      get().playStory(currentStory);
    }
  },
}));

// Initialize voice listener
if (typeof window !== 'undefined' && window.speechSynthesis) {
  useAudioPlayer.getState().refreshVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    useAudioPlayer.getState().refreshVoices();
  };
}
