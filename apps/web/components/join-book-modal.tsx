'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePaperFoldUnfold } from '../animations/physics';
import { bookService } from '../services/book-service';
import { audioService } from '../services/audio-service';
import { BookOpen, Clipboard, Check, Sparkles, X, Key, Landmark } from 'lucide-react';

interface JoinBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (book: any) => void;
}

export function JoinBookModal({ isOpen, onClose, onSuccess }: JoinBookModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Code value
  const [code, setCode] = useState('');

  // UI state managers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [joinedBook, setJoinedBook] = useState<any | null>(null);

  // Apply paper folding/unfolding physics
  usePaperFoldUnfold(modalRef, isOpen, { direction: 'top', tension: 1.7 });

  // Sound triggers
  useEffect(() => {
    if (isOpen) {
      audioService.playPaperShuffle();
      setCode('');
      setJoinedBook(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMsg('A keycode is required to seek entry into the locked archives.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await bookService.joinBook(cleanCode);
      
      // Sound feedback for successful library access
      audioService.playWaxStamp();
      setJoinedBook(response.book);
    } catch (err: any) {
      console.error(err);
      // Play brief page tear/scrape warning sound
      audioService.playWaxStamp(); // Fallback to wax stamp or shuffle
      setErrorMsg(
        err.message || 
        'The volume code you provided does not match any bound chronicle in our archives. Please verify your script coordinates.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBeginReading = () => {
    if (!joinedBook) return;
    audioService.playBookOpen();
    onSuccess(joinedBook);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none animate-fade-in">
      {/* Container wrapper for physical perspective folds */}
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-paper-surface border-2 border-accent-gold rounded-lg shadow-book overflow-hidden text-ink-primary font-sans relative"
        style={{ transformOrigin: 'top center' }}
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.01)_0%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-b from-accent-gold via-accent-gold/40 to-transparent" />

        {/* Lintel / Leather Spine Top Border */}
        <div className="bg-[#1e130a] text-paper-surface px-4 py-3 flex items-center justify-between border-b border-accent-gold/30">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-accent-gold" />
            <span className="font-playfair text-xs md:text-sm tracking-widest uppercase text-accent-gold font-bold">
              Archival Ledger Admittance
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-paper-surface/60 hover:text-paper-surface hover:bg-white/5 p-1 rounded-full transition-all cursor-pointer"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Parchment Core Body */}
        <div className="p-6 space-y-6 relative max-h-[80vh] overflow-y-auto">
          {!joinedBook ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-playfair font-bold text-ink-primary tracking-tight">
                  Unlock a Bound Volume
                </h3>
                <p className="text-xs font-serif italic text-ink-muted mt-1">
                  Enter the unique ledger code to align your mind with the active scribes
                </p>
              </div>

              {/* Handwritten notebook scrap error per Volume 9 Section 10 */}
              {errorMsg && (
                <div className="p-4 rounded bg-[#fcf5e3] border border-[#e6dbb9] shadow-sm relative text-[#5c3e16] font-serif text-xs italic leading-relaxed animate-fade-in my-3 border-l-4 border-l-[#9e1b32]/40">
                  {/* Subtle paper tab decorative pin */}
                  <div className="absolute top-[-6px] left-[50%] translate-x-[-50%] w-10 h-3 bg-white/50 border border-stone-200/50 shadow-sm opacity-90 rounded" />
                  <div className="pt-1 text-center">
                    &ldquo;{errorMsg}&rdquo;
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {/* Book Code Field */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-accent-gold font-serif mb-1.5 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-[#9e1b32]" />
                    Unique Archive Code <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AB49XY"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="w-full px-4 py-3 rounded border-2 border-paper-border bg-paper-surface-dim text-center text-xl font-mono uppercase tracking-widest text-[#9e1b32] placeholder:text-ink-muted/30 focus:outline-none focus:border-accent-gold focus:bg-paper-surface/40 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-paper-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-paper-border bg-paper-surface hover:bg-paper-surface-dim text-ink-secondary rounded text-xs tracking-wider uppercase font-semibold cursor-pointer transition-all"
                >
                  Withdraw
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim()}
                  className="px-5 py-2 rounded bg-ink-primary hover:bg-ink-secondary text-paper-surface border border-ink-primary hover:border-accent-gold hover:text-accent-gold font-playfair font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all shadow-md"
                >
                  {isSubmitting ? 'Verifying coordinates...' : 'Access Archive'}
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4 animate-fade-in">
              <div className="inline-flex p-3 bg-status-success-bg/20 border border-status-success-border rounded-full text-status-success mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-playfair font-bold text-ink-primary tracking-tight">
                  Archive Unlocked!
                </h3>
                <p className="text-xs font-serif italic text-[#1b4d22] mt-1 font-semibold">
                  You are now an authorized member of this bound chronicle.
                </p>
              </div>

              <div className="p-4 bg-paper-surface-dim rounded-md border border-paper-border max-w-sm mx-auto text-left space-y-1.5 shadow-sm">
                <div className="text-xs font-serif text-ink-primary">
                  Title: <span className="font-bold">{joinedBook.title}</span>
                </div>
                <div className="text-xs font-serif text-ink-secondary">
                  Author: <span className="italic">By {joinedBook.author || 'Anonymous'}</span>
                </div>
                {joinedBook.description && (
                  <div className="text-[11px] font-serif text-ink-muted italic leading-relaxed line-clamp-2 mt-1 border-t border-paper-border/30 pt-1">
                    &ldquo;{joinedBook.description}&rdquo;
                  </div>
                )}
              </div>

              {/* Navigation Button */}
              <div className="pt-4 border-t border-paper-border max-w-sm mx-auto">
                <button
                  onClick={handleBeginReading}
                  className="w-full py-3 px-4 rounded bg-[#9e1b32] hover:bg-[#b2223a] text-paper-surface font-playfair font-bold text-sm uppercase tracking-widest border border-[#fbf9f4]/20 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4 text-accent-gold" />
                  Begin Scribing (Open Book)
                </button>
                <p className="text-[10px] text-ink-light font-serif italic mt-2">
                  Opens double-spread interface and establishes direct chat channels.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
