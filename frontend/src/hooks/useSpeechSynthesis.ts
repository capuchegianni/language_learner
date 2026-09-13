import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseSpeechSynthesisOptions {
  defaultVoiceCode?: string;
  normalRate?: number;
  slowRate?: number;
}

export interface SpeakOptions {
  id?: string;
  voiceCode?: string;
  rate?: number;
}

export interface UseSpeechSynthesisReturn {
  speak: (text: string, options?: SpeakOptions) => void;
  stop: () => void;
  playingId: string | null;
  isSlow: boolean;
  isSupported: boolean;
}

/**
 * Custom hook for Web Speech API text-to-speech with rate toggling and active item tracking.
 * Consecutive clicks on the same item alternate between normal and slow speech rates.
 */
export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  const { defaultVoiceCode = 'ko-KR', normalRate = 0.9, slowRate = 0.6 } = options;
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isSlow, setIsSlow] = useState<boolean>(false);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const lastPlayedRef = useRef<{ id: string | null; isSlow: boolean }>({
    id: null,
    isSlow: false,
  });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    lastPlayedRef.current = { id: null, isSlow: false };
    setPlayingId(null);
    setIsSlow(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, speakOptions: SpeakOptions = {}) => {
      if (!isSupported) {
        alert('Speech synthesis is not supported in this browser.');
        return;
      }

      if (!text) return;

      window.speechSynthesis.cancel();

      const itemId = speakOptions.id || text;
      const last = lastPlayedRef.current;
      const willPlaySlow =
        speakOptions.rate !== undefined
          ? speakOptions.rate <= slowRate
          : last.id === itemId && !last.isSlow;

      const rate = speakOptions.rate ?? (willPlaySlow ? slowRate : normalRate);
      const voiceCode = speakOptions.voiceCode || defaultVoiceCode;

      lastPlayedRef.current = { id: itemId, isSlow: willPlaySlow };
      setIsSlow(willPlaySlow);
      setPlayingId(itemId);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceCode;
      utterance.rate = rate;

      // Match browser voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const cleanCode = voiceCode.toLowerCase().replace('_', '-');
          const prefix = cleanCode.split('-')[0];
          const matchedVoice =
            voices.find((v) => v.lang.toLowerCase().replace('_', '-') === cleanCode) ||
            voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }
      } catch {
        // Fallback to default utterance settings
      }

      utteranceRef.current = utterance;

      utterance.onend = () => {
        utteranceRef.current = null;
        setPlayingId((curr) => (curr === itemId ? null : curr));
        setIsSlow(false);
      };

      utterance.onerror = () => {
        utteranceRef.current = null;
        setPlayingId((curr) => (curr === itemId ? null : curr));
        setIsSlow(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, defaultVoiceCode, normalRate, slowRate],
  );

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    playingId,
    isSlow,
    isSupported,
  };
}

