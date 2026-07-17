'use client';

import React, { useEffect, Suspense, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bookshelf, OpenBook, StickyNoteNotifications } from '../components';
import { useActiveBookStore } from '../stores/active-book-store';
import { useUserStore } from '../stores/user-store';
import { AuthJournal } from '../features/auth';
import { bookService } from '../services/book-service';
import { useHardcoverAnimation } from '../animations';

type TransitionState = 'idle' | 'settling_auth' | 'opening_book' | 'completed';

interface BookOpenTransitionProps {
  onComplete: () => void;
}

function BookOpenTransition({ onComplete }: BookOpenTransitionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealingShelf, setIsRevealingShelf] = useState(false);
  const bookSpreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start opening transition on next tick
    const t = setTimeout(() => {
      setIsOpen(true);
    }, 50);
    return () => clearTimeout(t);
  }, []);

  useHardcoverAnimation(
    bookSpreadRef,
    isOpen,
    {
      leftPageSelector: '.left-page-container',
      rightPageSelector: '.right-page-container',
      gutterSelector: '.gutter-crease',
    },
    () => {
      // Once open animation finishes, trigger fade out to reveal bookshelf
      setIsRevealingShelf(true);
      const t = setTimeout(() => {
        onComplete();
      }, 500); // 500ms fade-to-bookshelf crossfade
    }
  );

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-[#1c0f07] via-[#2d160a] to-[#0f0603] flex items-center justify-center p-4 md:p-8 relative select-none overflow-hidden transition-all duration-500 ease-in-out ${
        isRevealingShelf ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Soft spotlight lighting layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none z-10" />
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(229,193,88,0.06)_0%,transparent_60%)] pointer-events-none z-10" />

      {/* DOUBLE-SPREAD OPEN BOOK FRAME */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-center relative my-2 z-10">
        {/* PHYSICAL LEATHER COVER BACKING FRAME */}
        <div 
          ref={bookSpreadRef} 
          className="w-full bg-[#1b1008] rounded-[24px] p-2 md:p-3 shadow-book relative flex border-2 border-[#dfd5af]/20 overflow-visible"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Subtle leather fold grain */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none" />
          
          {/* Inner embossed gold lining board border */}
          <div className="absolute inset-2 border border-[#d4af37]/20 rounded-[18px] pointer-events-none" />

          {/* OPEN-BOOK STACKED LEAVES FRAME */}
          <div className="w-full bg-paper-surface rounded-2xl relative overflow-hidden flex flex-col md:flex-row shadow-depth border-b-[6px] border-r-[6px] border-l-[3px] border-t-[1px] border-[#dcd1ba]">

            {/* Stacked leaves edge lines bottom/right margins */}
            <div className="absolute bottom-0 inset-x-0 h-[6px] bg-gradient-to-t from-[#cfc3ab] to-[#f4ebe1] border-t border-[#dfd5af]/40 pointer-events-none" />
            <div className="absolute right-0 inset-y-0 w-[6px] bg-gradient-to-l from-[#cfc3ab] to-[#f4ebe1] border-l border-[#dfd5af]/40 pointer-events-none" />
            <div className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-r from-[#cfc3ab] to-[#f4ebe1] border-r border-[#dfd5af]/40 pointer-events-none" />

            {/* ==================== LEFT PAGE CONTAINER ==================== */}
            <div className="flex-1 min-h-[400px] md:min-h-[500px] p-8 flex flex-col justify-center items-center relative overflow-hidden bg-paper-surface rounded-l-2xl left-page-container">
              {/* Inner Page fold shadow */}
              <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-black/[0.02] to-black/[0.12] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.01)_0%,transparent_100%)] pointer-events-none" />
              
              {/* Left page content: beautiful vintage illustration or quote */}
              <div className="text-center space-y-4 max-w-sm">
                <span className="text-accent-gold/40 text-xl font-serif">❦</span>
                <h3 className="text-2xl font-playfair font-black tracking-[0.2em] text-[#8f2d1b] uppercase">
                  BookChat
                </h3>
                <p className="text-xs font-serif text-ink-muted italic">
                  Archival Ledger
                </p>
              </div>
            </div>

            {/* ==================== CENTER SPINE / GUTTER CREASE ==================== */}
            <div className="hidden md:flex flex-col items-center justify-center relative w-8 z-20 self-stretch pointer-events-none gutter-crease">
              <div className="absolute inset-y-0 -left-1 w-[4px] bg-gradient-to-r from-black/5 to-transparent" />
              <div className="absolute inset-y-0 -right-1 w-[4px] bg-gradient-to-l from-black/5 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/20" />
              <div className="w-[1.5px] h-full bg-black/45" />
            </div>

            {/* ==================== RIGHT PAGE CONTAINER ==================== */}
            <div className="flex-1 min-h-[400px] md:min-h-[500px] p-8 flex flex-col justify-center items-center relative overflow-hidden bg-paper-surface rounded-r-2xl right-page-container">
              {/* Inner Page fold shadow */}
              <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-l from-transparent via-black/[0.02] to-black/[0.12] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.01)_0%,transparent_100%)] pointer-events-none" />

              {/* Right page content: elegant message */}
              <div className="text-center space-y-4 max-w-sm">
                <span className="text-accent-gold/40 text-xl font-serif">❦</span>
                <p className="font-handwritten text-2xl text-ink-primary/95 leading-relaxed tracking-wide font-medium">
                  The gates of the archives swing wide...
                </p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#8f7d61]">
                  Scribe Ledger Directory
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function BookshelfWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className={`transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeBook, setActiveBook } = useActiveBookStore();
  const { isAuthenticated, isLoading, isInitialized, initializeAuth } = useUserStore();

  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const bookId = searchParams.get('book');

  // 1. Initialize user state check on load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle open book transition state machine
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const shouldPlay = sessionStorage.getItem('play_book_open_transition') === 'true';
      if (shouldPlay && transitionState === 'idle') {
        setTransitionState('settling_auth');
      } else if (!shouldPlay && transitionState === 'idle') {
        setTransitionState('completed');
      }
    } else if (isInitialized && !isAuthenticated) {
      setTransitionState('idle');
    }
  }, [isInitialized, isAuthenticated, transitionState]);

  useEffect(() => {
    if (transitionState === 'settling_auth') {
      const t = setTimeout(() => {
        setTransitionState('opening_book');
      }, 400); // Wait for auth forms to fade out gracefully
      return () => clearTimeout(t);
    }
  }, [transitionState]);

  // Synchronize URL route with active book store
  useEffect(() => {
    if (bookId) {
      // Resolve custom book details from database
      const fetchCustomBook = async () => {
        try {
          const b = await bookService.getBook(bookId);
          if (b && (!activeBook || activeBook.id !== bookId)) {
            setActiveBook({
              id: b.id,
              title: b.title,
              author: b.author || 'Anonymous',
              progressPercentage: 1,
              currentPage: 1,
              totalPages: 100,
              creatorId: b.creatorId,
              creator: b.creator,
            });
          }
        } catch (err) {
          console.error('Failed to resolve custom book from URL:', err);
        }
      };
      fetchCustomBook();
    } else {
      if (activeBook) {
        setActiveBook(null);
      }
    }
  }, [bookId, activeBook, setActiveBook]);

  const handleSelectBook = (book: any) => {
    router.push(`/?book=${book.id}`);
  };

  const handleBackToShelf = () => {
    router.push('/');
  };

  // 2. Display warm library loader when restoring session
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-paper-bg flex items-center justify-center text-ink-muted italic font-serif text-sm">
        Opening Circulating Archives...
      </div>
    );
  }

  // 3. Complete route protection: greet guest with leather-bound auth journal
  if (!isAuthenticated) {
    return <AuthJournal />;
  }

  if (transitionState === 'settling_auth') {
    return <AuthJournal isSettling={true} />;
  }

  if (transitionState === 'opening_book') {
    return (
      <BookOpenTransition 
        onComplete={() => {
          sessionStorage.removeItem('play_book_open_transition');
          setTransitionState('completed');
        }} 
      />
    );
  }

  if (activeBook || bookId) {
    return (
      <>
        <OpenBook onBackToShelf={handleBackToShelf} />
        <StickyNoteNotifications />
      </>
    );
  }

  return (
    <BookshelfWrapper>
      <Bookshelf onSelectBook={handleSelectBook} />
      <StickyNoteNotifications />
    </BookshelfWrapper>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper-bg flex items-center justify-center text-ink-muted italic font-serif text-sm">
        Loading Circulating Archives...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
