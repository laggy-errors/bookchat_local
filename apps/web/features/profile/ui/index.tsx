'use client';

import React, { useState } from 'react';
import { useProfile } from '../hooks';
import { audioService } from '../../../services/audio-service';
import { 
  Key, 
  Compass, 
  Flame, 
  BookOpen, 
  Bookmark, 
  PenTool, 
  Hourglass,
  Edit2,
  Check,
  X,
  User,
  Heart
} from 'lucide-react';

const EMBLEMS = [
  { id: 'key', label: 'Keeper Key', icon: Key },
  { id: 'compass', label: 'Voyager Compass', icon: Compass },
  { id: 'flame', label: 'Candle Flame', icon: Flame },
  { id: 'book', label: 'Open Folio', icon: BookOpen },
  { id: 'pen', label: 'Scribe Quill', icon: PenTool },
  { id: 'hourglass', label: 'Chronos Hourglass', icon: Hourglass },
];

export function ProfileCard() {
  const { profile, isLoading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // Stores emblem id (e.g. 'key', 'compass')

  // Set up edit states when opening the edit panel
  const handleStartEdit = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl || 'pen');
      setIsEditing(true);
      audioService.playPaperShuffle();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    audioService.playPaperShuffle();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName,
        bio,
        avatarUrl,
      });
      setIsEditing(false);
      audioService.playPenFinish();
    } catch (err) {
      console.warn('Could not save profile:', err);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-ink-muted/60 font-serif">
        <Hourglass className="w-8 h-8 animate-spin mb-2 text-accent-gold" />
        <p className="text-xs italic">Unrolling parchment ledger...</p>
      </div>
    );
  }

  // Find active emblem icon
  const selectedEmblemId = profile.avatarUrl || 'pen';
  const EmblemConfig = EMBLEMS.find(e => e.id === selectedEmblemId) || EMBLEMS[4];
  const EmblemIcon = EmblemConfig.icon;

  return (
    <div className="space-y-4 pt-2 font-serif text-ink-primary select-none animate-fade-in relative">
      
      {!isEditing ? (
        /* ================= EX-LIBRIS BOOKPLATE VIEW ================= */
        <div 
          id="ex-libris-bookplate" 
          className="relative bg-[#fbf9f4] p-5 rounded-md border-2 border-double border-[#8f7d61] shadow-paper flex flex-col items-center text-center space-y-4 overflow-hidden"
        >
          {/* Ornate corner vignettes */}
          <div className="absolute top-1 left-1 text-[11px] text-[#8f7d61]/40 select-none">❧</div>
          <div className="absolute top-1 right-1 text-[11px] text-[#8f7d61]/40 select-none">☙</div>
          <div className="absolute bottom-1 left-1 text-[11px] text-[#8f7d61]/40 select-none">☙</div>
          <div className="absolute bottom-1 right-1 text-[11px] text-[#8f7d61]/40 select-none">❧</div>

          {/* Thin inner border */}
          <div className="absolute inset-1.5 border border-[#8f7d61]/25 pointer-events-none rounded" />

          {/* Header gothic banner */}
          <div className="space-y-0.5 relative z-10 pt-1">
            <h4 className="text-2xl font-playfair font-black tracking-[0.2em] text-[#8f2d1b] uppercase">
              Ex Libris
            </h4>
            <div className="w-24 h-[1px] bg-[#8f7d61]/45 mx-auto" />
            <p className="text-[8px] uppercase tracking-wider text-ink-muted">
              Of the Circulating Scholar Guild
            </p>
          </div>

          {/* Majestic Woodcut Emblem Illustration Frame */}
          <div className="relative p-4 rounded-full border border-dashed border-[#8f7d61]/50 bg-[#fbf9f4] shadow-sm flex items-center justify-center w-16 h-16 group transition-all duration-300 hover:border-accent-gold hover:scale-105">
            <EmblemIcon className="w-8 h-8 text-[#8f2d1b]" />
            <div className="absolute -bottom-1 text-[7px] uppercase font-bold tracking-widest text-accent-gold bg-[#fbf9f4] px-1.5 border border-[#8f7d61]/20 rounded">
              {EmblemConfig.label}
            </div>
          </div>

          {/* Owner Display Name */}
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8f7d61]">
              This Folio Belongs To
            </p>
            <h3 className="text-lg font-bold font-playfair tracking-wide text-ink-primary">
              {profile.displayName}
            </h3>
          </div>

          {/* Bio/Motto Block */}
          <div className="relative w-full max-w-xs px-4">
            {/* Elegant curly braces */}
            <span className="absolute left-0 top-0 text-2xl font-serif text-[#8f7d61]/35">“</span>
            <p className="text-[11px] text-ink-secondary italic leading-relaxed text-justify px-3 font-serif py-1">
              {profile.bio}
            </p>
            <span className="absolute right-0 bottom-0 text-2xl font-serif text-[#8f7d61]/35">”</span>
          </div>

          {/* Ex-Libris Seal details */}
          <div className="w-full pt-2 border-t border-dashed border-paper-border flex justify-between items-center text-[8px] uppercase tracking-wider text-ink-muted">
            <span>Archived Ledger v2.1</span>
            <button
              onClick={handleStartEdit}
              type="button"
              className="px-2 py-0.5 rounded border border-[#8f7d61]/30 hover:border-accent-gold hover:text-accent-gold transition-all flex items-center gap-1 cursor-pointer focus:outline-none text-[8px] uppercase tracking-wider font-bold"
              title="Recarve Bookplate Details"
            >
              <Edit2 className="w-2 h-2" />
              Carve Plate
            </button>
            <span>Verified Scribe</span>
          </div>

        </div>
      ) : (
        /* ================= EX-LIBRIS EDIT CARVING VIEW ================= */
        <form 
          onSubmit={handleSaveEdit}
          className="bg-[#fbf9f4] p-5 rounded-md border-2 border-[#8f7d61]/60 shadow-paper relative space-y-4"
        >
          {/* Ornate elements */}
          <div className="absolute inset-1.5 border border-dashed border-[#8f7d61]/30 pointer-events-none rounded" />
          
          <div className="text-center pb-2 border-b border-paper-border/60">
            <span className="text-[8px] uppercase font-bold tracking-widest text-accent-gold block">
              Recarving Steel Die
            </span>
            <h4 className="text-sm font-bold font-playfair text-ink-primary mt-0.5">
              Plate Specifications
            </h4>
          </div>

          {/* Name input */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold tracking-widest text-accent-gold block">
              Scholar Signature
            </label>
            <input
              type="text"
              required
              id="profile-name-input"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                // Soft pencil feedback sound on keystroke
                if (Math.random() > 0.4) audioService.playPenScratch(0.04, 1500);
              }}
              className="w-full bg-paper-surface p-2 rounded border border-paper-border text-xs focus:outline-none focus:border-accent-gold font-sans text-ink-primary"
              placeholder="e.g. Scribe Emma"
            />
          </div>

          {/* Motto/Bio textarea */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold tracking-widest text-accent-gold block">
              Personal Motto (Marginalia Bio)
            </label>
            <textarea
              required
              id="profile-bio-input"
              rows={3}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                if (Math.random() > 0.4) audioService.playPenScratch(0.05, 1200);
              }}
              className="w-full bg-paper-surface p-2 rounded border border-paper-border text-xs focus:outline-none focus:border-accent-gold font-serif italic text-ink-primary leading-normal resize-none"
              placeholder="Write a short personal motto or scribe bio..."
              maxLength={150}
            />
          </div>

          {/* Emblem selection grid */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold tracking-widest text-accent-gold block">
              Select Bookplate Heraldry
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EMBLEMS.map((em) => {
                const isSelected = avatarUrl === em.id;
                const EmIcon = em.icon;

                return (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(em.id);
                      audioService.playRibbonSlide();
                    }}
                    className={`p-1.5 rounded border flex flex-col items-center text-center transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-gold ${
                      isSelected 
                        ? 'border-[#8f2d1b] bg-paper-surface-dim shadow-inner' 
                        : 'border-paper-border hover:border-[#8f7d61]/40'
                    }`}
                  >
                    <EmIcon className={`w-4 h-4 ${isSelected ? 'text-[#8f2d1b]' : 'text-ink-secondary/60'}`} />
                    <span className="text-[8px] uppercase tracking-wider text-ink-muted mt-1 leading-none">
                      {em.label.split(' ')[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-paper-border/30">
            <button
              type="button"
              id="cancel-profile-btn"
              onClick={handleCancelEdit}
              className="flex-1 py-1.5 rounded border border-paper-border hover:border-status-error text-[10px] uppercase font-bold tracking-wider hover:bg-status-error-bg hover:text-accent-red flex items-center justify-center gap-1 cursor-pointer transition-all focus:outline-none"
            >
              <X className="w-3 h-3" />
              Discard
            </button>
            <button
              type="submit"
              id="save-profile-btn"
              className="flex-1 py-1.5 rounded bg-[#8f2d1b] border border-[#8f2d1b]/20 text-paper-surface hover:bg-[#a13421] text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all focus:outline-none"
            >
              <Check className="w-3 h-3 text-accent-gold" />
              Carve Plate
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
