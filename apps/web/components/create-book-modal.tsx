'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePaperFoldUnfold } from '../animations/physics';
import { bookService } from '../services/book-service';
import { audioService } from '../services/audio-service';
import { BookOpen, Clipboard, Check, Sparkles, X, Plus, FileText, User, HelpCircle, Image, Landmark } from 'lucide-react';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (book: any) => void;
}

export function CreateBookModal({ isOpen, onClose, onSuccess }: CreateBookModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Form values
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverColor, setCoverColor] = useState('burgundy');

  // UI state managers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdBook, setCreatedBook] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Apply paper folding/unfolding physics
  usePaperFoldUnfold(modalRef, isOpen, { direction: 'top', tension: 1.7 });

  // Sound triggers
  useEffect(() => {
    if (isOpen) {
      audioService.playPaperShuffle();
      // Reset form on open
      setTitle('');
      setAuthor('');
      setDescription('');
      setCoverUrl('');
      setIsbn('');
      setCoverColor('burgundy');
      setCreatedBook(null);
      setErrorMsg(null);
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('A book must possess a title to be scribed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const book = await bookService.create({
        title: title.trim(),
        author: author.trim() || undefined,
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        isbn: isbn.trim() || undefined,
        coverColor,
      });

      // Sound feedback for successful ledger writing
      audioService.playWaxStamp();
      setCreatedBook(book);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Scribing failed. Is the library system offline?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    if (!createdBook?.joinCode) return;
    try {
      await navigator.clipboard.writeText(createdBook.joinCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy code to clipboard');
    }
  };

  const handleBeginScribing = () => {
    if (!createdBook) return;
    audioService.playBookOpen();
    onSuccess(createdBook);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      {/* Container wrapper for physical perspective folds */}
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-paper-surface border-2 border-accent-gold rounded-lg shadow-book overflow-hidden text-ink-primary font-sans relative"
        style={{ transformOrigin: 'top center' }}
      >
        {/* Paper texture overlay and wax watermark styling */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.01)_0%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-b from-accent-gold via-accent-gold/40 to-transparent" />

        {/* Lintel / Leather Spine Top Border */}
        <div className="bg-[#1e130a] text-paper-surface px-4 py-3 flex items-center justify-between border-b border-accent-gold/30">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-accent-gold" />
            <span className="font-playfair text-xs md:text-sm tracking-widest uppercase text-accent-gold font-bold">
              Circulating Ledger Scriptorium
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
          {!createdBook ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-playfair font-bold text-ink-primary tracking-tight">
                  Scribe a New Chronicle
                </h3>
                <p className="text-xs font-serif italic text-ink-muted mt-1">
                  Bind a fresh volume into the Digital Archives of the Circulating Library
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-status-error-bg/20 text-status-error border border-status-error-border text-xs font-serif italic animate-fade-in">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3 pt-2">
                {/* Book Title Field */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-accent-gold font-serif mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#9e1b32]" />
                    Book Title <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Volume XIV: Cosmic Typography"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-surface-dim text-sm text-ink-primary placeholder:text-ink-muted/40 focus:outline-none focus:border-accent-gold focus:bg-paper-surface/40 transition-all font-serif"
                  />
                </div>

                {/* Optional Author Field */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-ink-muted font-serif mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Authorized Scribe (Author)
                  </label>
                  <input
                    type="text"
                    placeholder="Anonymous Scribe"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-surface-dim text-sm text-ink-primary placeholder:text-ink-muted/40 focus:outline-none focus:border-accent-gold focus:bg-paper-surface/40 transition-all font-serif"
                  />
                </div>

                {/* Optional Synopsis / Description */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-ink-muted font-serif mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Book Synopsis / Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Summarize the core inquiries, guidelines, or conversation topics of this volume..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-surface-dim text-sm text-ink-primary placeholder:text-ink-muted/40 focus:outline-none focus:border-accent-gold focus:bg-paper-surface/40 transition-all font-serif resize-none"
                  />
                </div>

                {/* Grid for Cover URL & ISBN */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-ink-muted font-serif mb-1.5 flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" />
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-paper-border bg-paper-surface-dim text-sm text-ink-primary placeholder:text-ink-muted/40 focus:outline-none focus:border-accent-gold focus:bg-paper-surface/40 transition-all font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-ink-muted font-serif mb-1.5 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Book ISBN
                    </label>
                    <input
                      type="text"
                      placeholder="Optional catalog ID"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-paper-border bg-paper-surface-dim text-sm text-ink-primary placeholder:text-ink-muted/40 focus:outline-none focus:border-accent-gold focus:bg-paper-surface/40 transition-all font-serif"
                    />
                  </div>
                </div>

                {/* Book Spine Color Picker */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-accent-gold font-serif mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
                    Book Spine Color & Theme
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-paper-surface-dim border border-paper-border rounded-lg justify-start">
                    {[
                      { key: 'burgundy', label: 'Burgundy', bg: 'bg-gradient-to-r from-[#5c201e] to-[#85302c]' },
                      { key: 'forest-green', label: 'Forest Green', bg: 'bg-gradient-to-r from-[#1b2a1a] to-[#2d422b]' },
                      { key: 'navy', label: 'Navy Blue', bg: 'bg-gradient-to-r from-[#0d1b2a] to-[#1b263b]' },
                      { key: 'warm-brown', label: 'Warm Brown', bg: 'bg-gradient-to-r from-[#421d12] to-[#612c1b]' },
                      { key: 'slate-blue', label: 'Slate Blue', bg: 'bg-gradient-to-r from-[#17253d] to-[#243a5e]' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          audioService.playPaperShuffle();
                          setCoverColor(item.key);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-serif transition-all duration-200 cursor-pointer focus:outline-none
                          ${coverColor === item.key 
                            ? 'border-[#9e1b32] bg-[#9e1b32]/5 font-bold text-ink-primary shadow-sm scale-105' 
                            : 'border-paper-border hover:border-accent-gold/40 text-ink-muted'
                          }`}
                        title={`Select ${item.label} spine color`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner shrink-0 ${item.bg}`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-light font-serif italic mt-1">
                    This selection determines the premium 3D spine color of this volume on the bookshelf.
                  </p>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-paper-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-paper-border bg-paper-surface hover:bg-paper-surface-dim text-ink-secondary rounded text-xs tracking-wider uppercase font-semibold cursor-pointer transition-all"
                >
                  Close Ledger
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-5 py-2 rounded bg-ink-primary hover:bg-ink-secondary text-paper-surface border border-ink-primary hover:border-accent-gold hover:text-accent-gold font-playfair font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all shadow-md"
                >
                  {isSubmitting ? 'Scribing Volume...' : 'Write into Ledger'}
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
                  Ledger Registered Successfully!
                </h3>
                <p className="text-xs font-serif italic text-ink-muted mt-1">
                  Your new custom volume is now bound and filed under our archives.
                </p>
              </div>

              {/* Unique Join Code Display Box */}
              <div className="p-4 rounded-lg bg-paper-surface-dim border border-accent-gold/40 max-w-sm mx-auto relative shadow-inner overflow-hidden">
                <div className="absolute top-1 left-1.5 text-[9px] uppercase font-bold tracking-wider text-accent-gold/60 font-serif">
                  Unique Join Code
                </div>
                
                <div className="py-4 font-mono text-3xl font-black text-[#9e1b32] tracking-widest uppercase select-all">
                  {createdBook.joinCode}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded bg-paper-surface border border-paper-border hover:border-accent-gold text-[10px] text-ink-muted hover:text-accent-gold flex items-center gap-1 mx-auto cursor-pointer transition-all shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-accent-green" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3 h-3" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-paper-surface-dim rounded border border-paper-border max-w-sm mx-auto text-left space-y-1.5">
                <div className="text-xs font-serif text-ink-primary">
                  Title: <span className="font-bold">{createdBook.title}</span>
                </div>
                <div className="text-xs font-serif text-ink-secondary">
                  Author: <span className="italic">By {createdBook.author}</span>
                </div>
                {createdBook.description && (
                  <div className="text-[11px] font-serif text-ink-muted italic leading-relaxed line-clamp-2">
                    &ldquo;{createdBook.description}&rdquo;
                  </div>
                )}
              </div>

              {/* Navigation Button */}
              <div className="pt-4 border-t border-paper-border max-w-sm mx-auto">
                <button
                  onClick={handleBeginScribing}
                  className="w-full py-3 px-4 rounded bg-[#9e1b32] hover:bg-[#b2223a] text-paper-surface font-playfair font-bold text-sm uppercase tracking-widest border border-[#fbf9f4]/20 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4 text-accent-gold animate-bounce" />
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
