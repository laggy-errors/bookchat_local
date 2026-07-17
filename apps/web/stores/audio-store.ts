import { create } from 'zustand';

interface AudioState {
  masterMute: boolean;
  uiVolume: number; // For general UI sounds like page flips, clicks, etc.
  writingVolume: number; // For fountain pen scratching
  ambienceVolume: number; // For background atmosphere/hum
  setMasterMute: (mute: boolean) => void;
  setUiVolume: (volume: number) => void;
  setWritingVolume: (volume: number) => void;
  setAmbienceVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set) => {
  // Safe localStorage checking for Next.js SSR
  const getSafeLocalStorage = (key: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key) || fallback;
    }
    return fallback;
  };

  const initialMute = getSafeLocalStorage('bookchat_master_mute', 'false') === 'true';
  const initialUiVol = parseFloat(getSafeLocalStorage('bookchat_ui_volume', '0.4'));
  const initialWritingVol = parseFloat(getSafeLocalStorage('bookchat_writing_volume', '0.5'));
  const initialAmbienceVol = parseFloat(getSafeLocalStorage('bookchat_ambience_volume', '0.2'));

  return {
    masterMute: initialMute,
    uiVolume: initialUiVol,
    writingVolume: initialWritingVol,
    ambienceVolume: initialAmbienceVol,

    setMasterMute: (mute) => {
      set({ masterMute: mute });
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookchat_master_mute', String(mute));
      }
    },
    setUiVolume: (volume) => {
      set({ uiVolume: Math.max(0, Math.min(1, volume)) });
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookchat_ui_volume', String(volume));
      }
    },
    setWritingVolume: (volume) => {
      set({ writingVolume: Math.max(0, Math.min(1, volume)) });
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookchat_writing_volume', String(volume));
      }
    },
    setAmbienceVolume: (volume) => {
      set({ ambienceVolume: Math.max(0, Math.min(1, volume)) });
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookchat_ambience_volume', String(volume));
      }
    },
  };
});
