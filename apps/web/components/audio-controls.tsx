'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAudioStore } from '../stores/audio-store';
import { audioService } from '../services/audio-service';
import { Volume2, VolumeX, Sliders, Play, Settings, X, Info } from 'lucide-react';
import gsap from 'gsap';

export function AudioControls() {
  const {
    masterMute,
    uiVolume,
    writingVolume,
    ambienceVolume,
    setMasterMute,
    setUiVolume,
    setWritingVolume,
    setAmbienceVolume,
  } = useAudioStore();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync background ambience play state when controls change
  useEffect(() => {
    if (!masterMute && ambienceVolume > 0) {
      audioService.startAmbience();
    } else {
      audioService.stopAmbience();
    }
  }, [masterMute, ambienceVolume]);

  const togglePanel = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      audioService.playJournalOpen();
    } else {
      audioService.playPenFinish();
    }
  };

  const testSound = (category: 'ui' | 'writing' | 'ambience') => {
    if (category === 'ui') {
      audioService.playPageFlip();
    } else if (category === 'writing') {
      audioService.playPenScratch(0.15, 1300);
    } else if (category === 'ambience') {
      audioService.playBookOpen();
    }
  };

  return (
    <div className="relative inline-block text-left select-none">
      {/* Trigger Button */}
      <button
        onClick={togglePanel}
        className="p-1.5 rounded bg-paper-surface/10 hover:bg-paper-surface/20 transition-all text-paper-surface focus:ring-1 focus:ring-accent-gold focus:outline-none flex items-center gap-1 border border-white/5 shadow-sm"
        title="Audio Calibration Console"
      >
        {masterMute ? (
          <VolumeX className="w-4 h-4 text-status-error opacity-75" />
        ) : (
          <Volume2 className="w-4 h-4 text-accent-gold" />
        )}
        <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline text-paper-surface/90 pr-0.5">
          Audio Console
        </span>
      </button>

      {/* Expanded Tactile Dialogue Console */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2.5 w-64 p-4 bg-[#fcfaf5] border-2 border-[#dcd1ba] rounded shadow-depth font-serif text-ink-primary z-50 animate-fade-in"
          style={{
            backgroundImage: `radial-gradient(circle at 100% 150%, rgba(212, 175, 55, 0.05) 24%, transparent 100%)`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ebdcb9] pb-2 mb-3">
            <h4 className="text-[11px] font-playfair font-extrabold uppercase tracking-widest text-[#9e1b32] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-accent-gold" />
              Acoustic Mixing Console
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-ink-muted hover:text-ink-primary p-0.5 rounded transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Master Mute Option */}
            <div className="flex items-center justify-between bg-[#f5ebd6]/60 border border-[#e1d3b5]/50 px-2.5 py-1.5 rounded">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
                Master Silence
              </span>
              <button
                onClick={() => setMasterMute(!masterMute)}
                className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border transition-all ${
                  masterMute
                    ? 'bg-[#9e1b32] border-[#7d1425] text-paper-surface shadow-sm'
                    : 'bg-paper-surface border-[#c4b693] text-ink-secondary hover:bg-paper-surface-dim'
                }`}
              >
                {masterMute ? 'Muted' : 'Unmuted'}
              </button>
            </div>

            {/* Sliders Container */}
            <div className="space-y-3">
              {/* Category 1: UI Sounds */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  <span className="flex items-center gap-1">
                    📖 UI Interaction
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px]">
                      {Math.round(uiVolume * 100)}%
                    </span>
                    <button
                      onClick={() => testSound('ui')}
                      className="p-0.5 text-accent-gold hover:text-accent-red transition-all"
                      title="Test Page Flip"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={uiVolume}
                  onChange={(e) => setUiVolume(parseFloat(e.target.value))}
                  disabled={masterMute}
                  className="w-full h-1 bg-[#e3d8be] rounded-lg appearance-none cursor-pointer accent-[#9e1b32] disabled:opacity-40"
                />
              </div>

              {/* Category 2: Writing Sounds */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  <span className="flex items-center gap-1">
                    ✒ Fountain Pen
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px]">
                      {Math.round(writingVolume * 100)}%
                    </span>
                    <button
                      onClick={() => testSound('writing')}
                      className="p-0.5 text-accent-gold hover:text-accent-red transition-all"
                      title="Test Scratch"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={writingVolume}
                  onChange={(e) => setWritingVolume(parseFloat(e.target.value))}
                  disabled={masterMute}
                  className="w-full h-1 bg-[#e3d8be] rounded-lg appearance-none cursor-pointer accent-[#9e1b32] disabled:opacity-40"
                />
              </div>

              {/* Category 3: Ambient Atmosphere */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  <span className="flex items-center gap-1">
                    🔥 Ambient Hearth
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px]">
                      {Math.round(ambienceVolume * 100)}%
                    </span>
                    <button
                      onClick={() => testSound('ambience')}
                      className="p-0.5 text-accent-gold hover:text-accent-red transition-all"
                      title="Test Ambient Thud"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambienceVolume}
                  onChange={(e) => setAmbienceVolume(parseFloat(e.target.value))}
                  disabled={masterMute}
                  className="w-full h-1 bg-[#e3d8be] rounded-lg appearance-none cursor-pointer accent-[#9e1b32] disabled:opacity-40"
                />
              </div>
            </div>

            {/* Mixing Note */}
            <div className="flex gap-1.5 text-[9px] text-ink-muted italic border-t border-[#ebdcb9] pt-2 mt-1 leading-relaxed">
              <Info className="w-3.5 h-3.5 shrink-0 text-accent-gold mt-0.5" />
              <span>
                Prioritizes reading clarity, utilizing zero-latency web synthesizers. Settings auto-save.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
