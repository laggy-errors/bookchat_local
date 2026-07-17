'use client';

import React, { useEffect } from 'react';
import { useSettings } from '../hooks';
import { THEMES, ThemeType } from '../../../app/tokens';
import { audioService } from '../../../services/audio-service';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Zap, 
  ZapOff, 
  Type, 
  Sliders, 
  Sparkles,
  Check
} from 'lucide-react';

export function SettingsForm() {
  const {
    theme,
    highContrast,
    largeText,
    reducedMotion,
    masterMute,
    uiVolume,
    writingVolume,
    ambienceVolume,
    isLoading,
    setTheme,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    setMasterMute,
    setUiVolume,
    setWritingVolume,
    setAmbienceVolume
  } = useSettings();

  // Play journal opening sensory sound on initial mount
  useEffect(() => {
    audioService.playJournalOpen();
  }, []);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    audioService.playRibbonSlide();
  };

  const handleSliderChange = (type: 'ui' | 'writing' | 'ambience', value: number) => {
    if (type === 'ui') {
      setUiVolume(value);
      audioService.playPaperShuffle();
    } else if (type === 'writing') {
      setWritingVolume(value);
      audioService.playPenScratch(0.12, 1000);
    } else if (type === 'ambience') {
      setAmbienceVolume(value);
      // Let the audio service adjust live ambient drones
      setTimeout(() => {
        audioService.updateAmbienceVolume();
      }, 50);
    }
  };

  return (
    <div id="settings-journal" className="space-y-6 pt-2 pb-4 font-serif text-ink-primary select-none animate-fade-in">
      
      {/* Decorative Gold Header Plaque */}
      <div className="text-center pb-3 border-b border-paper-border/60">
        <span className="text-[9px] uppercase font-bold tracking-widest text-accent-gold block">
          Cabinet Configuration
        </span>
        <h3 className="text-xl font-playfair font-black text-ink-primary mt-0.5">
          Vellum & Atmosphere
        </h3>
        <p className="text-[10px] font-serif italic text-ink-muted">
          Persisted to archival registry ledger
        </p>
      </div>

      {/* 1. Six Premium Theme Presets (Notebook Grid layout) */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Desk Vellum Presets
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(THEMES) as ThemeType[]).map((key) => {
            const t = THEMES[key];
            const isSelected = theme === key;

            // Render theme swatch dots
            const getSwatchBg = (tKey: ThemeType) => {
              if (tKey === 'classic-library') return 'bg-[#fdfaf2] border-[#2e1d13]';
              if (tKey === 'vintage-journal') return 'bg-[#f1e6cf] border-[#46382e]';
              if (tKey === 'night-reading') return 'bg-[#2d1d15] border-[#f6ebd8]';
              if (tKey === 'rainy-evening') return 'bg-[#e2e8f0] border-[#1a202c]';
              if (tKey === 'fireplace') return 'bg-[#3a1e12] border-[#130803]';
              if (tKey === 'collector-edition') return 'bg-[#fffff4] border-[#0f2e1e]';
              if (tKey === 'lined-journal') return 'bg-[#faf6ee] border-[#9e1b32]';
              return 'bg-white';
            };

            return (
              <button
                key={key}
                type="button"
                id={`theme-btn-${key}`}
                onClick={() => handleThemeChange(key)}
                className={`p-2 rounded text-left border transition-all relative flex flex-col justify-between h-[85px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-gold ${
                  isSelected 
                    ? 'border-accent-gold bg-paper-surface-dim/80 shadow-inner' 
                    : 'border-paper-border hover:border-accent-gold/40 hover:bg-paper-surface-dim/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold font-serif leading-tight">
                      {t.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-accent-gold" />
                    )}
                  </div>
                  <p className="text-[9px] text-ink-secondary italic leading-tight mt-0.5 opacity-80 line-clamp-2">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 mt-1.5">
                  <div className={`w-3 h-3 rounded-full border ${getSwatchBg(key)}`} />
                  <span className="text-[8px] uppercase tracking-wider text-ink-muted">
                    {key.replace('-', ' ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Skeuomorphic Audio atmosphere simulation with 3 sliders */}
      <div className="space-y-3 pt-2 border-t border-paper-border/30">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1.5">
            <Sliders className="w-3 h-3" />
            Acoustic Tuning
          </label>
          
          <button
            type="button"
            id="master-mute-toggle"
            onClick={() => setMasterMute(!masterMute)}
            className={`p-1 rounded border transition-all flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold cursor-pointer ${
              masterMute 
                ? 'bg-status-error-bg border-status-error text-accent-red' 
                : 'bg-paper-surface-dim border-paper-border text-ink-primary hover:border-accent-gold'
            }`}
          >
            {masterMute ? (
              <>
                <VolumeX className="w-3 h-3 text-accent-red" />
                Muted
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 text-accent-gold" />
                Audible
              </>
            )}
          </button>
        </div>

        <div className="space-y-2 bg-paper-surface-dim/60 p-2.5 rounded border border-paper-border/40">
          
          {/* UI Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold">Paper Rustle Volume (Flipped pages)</span>
              <span className="text-[9px] font-mono opacity-60">{Math.round(uiVolume * 100)}%</span>
            </div>
            <input
              type="range"
              id="slider-ui-volume"
              min="0"
              max="1"
              step="0.05"
              value={uiVolume}
              disabled={masterMute}
              onChange={(e) => handleSliderChange('ui', parseFloat(e.target.value))}
              className="w-full h-1 bg-paper-border rounded-lg appearance-none cursor-pointer accent-accent-gold disabled:opacity-30"
            />
          </div>

          {/* Quill / Writing Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold">Quill Friction Volume (Pen scratches)</span>
              <span className="text-[9px] font-mono opacity-60">{Math.round(writingVolume * 100)}%</span>
            </div>
            <input
              type="range"
              id="slider-writing-volume"
              min="0"
              max="1"
              step="0.05"
              value={writingVolume}
              disabled={masterMute}
              onChange={(e) => handleSliderChange('writing', parseFloat(e.target.value))}
              className="w-full h-1 bg-paper-border rounded-lg appearance-none cursor-pointer accent-accent-gold disabled:opacity-30"
            />
          </div>

          {/* Background Atmosphere Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold">Ambient Drone Volume (Study chamber)</span>
              <span className="text-[9px] font-mono opacity-60">{Math.round(ambienceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              id="slider-ambience-volume"
              min="0"
              max="1"
              step="0.05"
              value={ambienceVolume}
              disabled={masterMute}
              onChange={(e) => handleSliderChange('ambience', parseFloat(e.target.value))}
              className="w-full h-1 bg-paper-border rounded-lg appearance-none cursor-pointer accent-accent-gold disabled:opacity-30"
            />
          </div>

        </div>
      </div>

      {/* 3. Accessibility Toggles (Volume 13 section 14) */}
      <div className="space-y-2 pt-2 border-t border-paper-border/30">
        <label className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          Archival Accessibility
        </label>

        <div className="space-y-1.5">
          {/* Reduced Motion */}
          <button
            type="button"
            id="reduced-motion-toggle"
            onClick={toggleReducedMotion}
            className={`w-full p-2 rounded border flex items-center justify-between text-left transition-all text-[11px] cursor-pointer ${
              reducedMotion 
                ? 'bg-paper-surface-dim border-accent-gold font-bold shadow-inner' 
                : 'border-paper-border hover:border-accent-gold/40 hover:bg-paper-surface-dim/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {reducedMotion ? <ZapOff className="w-3.5 h-3.5 text-accent-gold" /> : <Zap className="w-3.5 h-3.5 opacity-60" />}
              <div>
                <p className="font-serif leading-tight">Reduce Paper Mechanics</p>
                <p className="text-[9px] text-ink-muted leading-none">Freeze curved 3D leaf folds and flips</p>
              </div>
            </div>
            <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${reducedMotion ? 'bg-accent-gold' : 'bg-paper-border'}`}>
              <div className={`bg-paper-surface w-2.5 h-2.5 rounded-full shadow-md transform transition-transform duration-200 ${reducedMotion ? 'translate-x-2.5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* High Contrast */}
          <button
            type="button"
            id="high-contrast-toggle"
            onClick={toggleHighContrast}
            className={`w-full p-2 rounded border flex items-center justify-between text-left transition-all text-[11px] cursor-pointer ${
              highContrast 
                ? 'bg-paper-surface-dim border-accent-gold font-bold shadow-inner' 
                : 'border-paper-border hover:border-accent-gold/40 hover:bg-paper-surface-dim/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 opacity-60" />
              <div>
                <p className="font-serif leading-tight">High Contrast Ink</p>
                <p className="text-[9px] text-ink-muted leading-none">Force absolute bone-white and obsidian colors</p>
              </div>
            </div>
            <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${highContrast ? 'bg-accent-gold' : 'bg-paper-border'}`}>
              <div className={`bg-paper-surface w-2.5 h-2.5 rounded-full shadow-md transform transition-transform duration-200 ${highContrast ? 'translate-x-2.5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Text Scale */}
          <button
            type="button"
            id="large-text-toggle"
            onClick={toggleLargeText}
            className={`w-full p-2 rounded border flex items-center justify-between text-left transition-all text-[11px] cursor-pointer ${
              largeText 
                ? 'bg-paper-surface-dim border-accent-gold font-bold shadow-inner' 
                : 'border-paper-border hover:border-accent-gold/40 hover:bg-paper-surface-dim/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 opacity-60" />
              <div>
                <p className="font-serif leading-tight">Enlarge Folio Text</p>
                <p className="text-[9px] text-ink-muted leading-none">Magnify letter spacing and typography scales</p>
              </div>
            </div>
            <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${largeText ? 'bg-accent-gold' : 'bg-paper-border'}`}>
              <div className={`bg-paper-surface w-2.5 h-2.5 rounded-full shadow-md transform transition-transform duration-200 ${largeText ? 'translate-x-2.5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}
