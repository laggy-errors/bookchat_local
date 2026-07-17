'use client';

import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../stores/theme-store';
import { useActiveBookStore } from '../stores/active-book-store';
import { useUserStore } from '../stores/user-store';
import { Search, BookMarked, User, Users, Landmark, FileText, Sparkles, Plus, Key } from 'lucide-react';
import { FormExample } from './form-example';
import { CreateBookModal } from './create-book-modal';
import { JoinBookModal } from './join-book-modal';
import { bookService } from '../services/book-service';
import { audioService } from '../services/audio-service';
import { getSocket } from '../lib/socket';

export interface BookshelfBook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  theme: 'classic-library' | 'vintage-journal' | 'night-reading' | 'rainy-evening' | 'fireplace' | 'collector-edition';
  spineBg: string; // Tailwind gradient classes for 3D spine representation
  accentColor: string; // Accent color border/ribbon
  textColor: string;
  readersActive: number;
  totalPages: number;
  currentPage: number;
  synopsis: string;
  published: string;
  volumeNumber?: string;
  unreadMessageCount?: number;
  creatorId?: string;
  creator?: {
    id: string;
    username?: string;
    email: string;
    profile?: {
      displayName?: string;
    };
  };
}

const THEMES: BookshelfBook['theme'][] = [
  'classic-library',
  'vintage-journal',
  'night-reading',
  'rainy-evening',
  'fireplace',
  'collector-edition'
];

const SPINE_BGS = [
  'bg-gradient-to-r from-[#421d12] via-[#612c1b] to-[#2e130a]', // brown
  'bg-gradient-to-r from-[#2c3327] via-[#414b39] to-[#1e231a]', // green
  'bg-gradient-to-r from-[#171a21] via-[#2a303e] to-[#0d1014]', // dark blue
  'bg-gradient-to-r from-[#17253d] via-[#243a5e] to-[#0c1320]', // indigo
  'bg-gradient-to-r from-[#5c201e] via-[#85302c] to-[#401211]', // red
];

const ACCENT_COLORS = [
  'border-[#c29738]',
  'border-[#ad8021]',
  'border-[#ffd43b]',
  'border-[#94a3b8]',
  'border-[#d4af37]',
];

const TEXT_COLORS = [
  'text-[#fbf9f4]',
  'text-[#e6dfd3]',
  'text-[#fffff4]',
  'text-[#f1f5f9]',
];

function romanize(num: number): string {
  const lookup: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || 'I';
}

function mapToBookshelfBook(book: any, index: number): BookshelfBook {
  const chosenColor = book.coverColor || 'burgundy';
  
  let theme: BookshelfBook['theme'] = THEMES[index % THEMES.length];
  let spineBg = SPINE_BGS[index % SPINE_BGS.length];
  let accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
  let textColor = TEXT_COLORS[index % TEXT_COLORS.length];

  if (chosenColor === 'burgundy') {
    theme = 'classic-library';
    spineBg = 'bg-gradient-to-r from-[#5c201e] via-[#85302c] to-[#401211]';
    accentColor = 'border-[#d4af37]';
    textColor = 'text-[#fbf9f4]';
  } else if (chosenColor === 'forest-green') {
    theme = 'vintage-journal';
    spineBg = 'bg-gradient-to-r from-[#1b2a1a] via-[#2d422b] to-[#121d11]';
    accentColor = 'border-[#c29738]';
    textColor = 'text-[#f1f5f9]';
  } else if (chosenColor === 'navy') {
    theme = 'night-reading';
    spineBg = 'bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#0a1128]';
    accentColor = 'border-[#ad8021]';
    textColor = 'text-[#fffff4]';
  } else if (chosenColor === 'warm-brown') {
    theme = 'fireplace';
    spineBg = 'bg-gradient-to-r from-[#421d12] via-[#612c1b] to-[#2e130a]';
    accentColor = 'border-[#ffd43b]';
    textColor = 'text-[#e6dfd3]';
  } else if (chosenColor === 'slate-blue') {
    theme = 'rainy-evening';
    spineBg = 'bg-gradient-to-r from-[#17253d] via-[#243a5e] to-[#0c1320]';
    accentColor = 'border-[#94a3b8]';
    textColor = 'text-[#fbf9f4]';
  }
  
  return {
    id: book.id,
    title: book.title,
    subtitle: book.isbn ? `ISBN: ${book.isbn}` : (book.joinCode ? `Code: ${book.joinCode}` : 'A custom chronicle'),
    author: book.author || 'Anonymous',
    theme,
    spineBg,
    accentColor,
    textColor,
    readersActive: 1,
    totalPages: 100,
    currentPage: 1,
    synopsis: book.description || 'A newly created circulating chronicle, added to the ledger by an authorized scribe.',
    published: new Date(book.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    volumeNumber: romanize(index + 1),
    unreadMessageCount: book.unreadMessageCount || 0,
    creatorId: book.creatorId,
    creator: book.creator,
  };
}

export const ARCHIVE_BOOKS: BookshelfBook[] = [];

interface BookshelfProps {
  onSelectBook: (book: BookshelfBook) => void;
}

export function Bookshelf({ onSelectBook }: BookshelfProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customBooks, setCustomBooks] = useState<BookshelfBook[]>([]);
  const [selectedBookDetail, setSelectedBookDetail] = useState<BookshelfBook | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [ledgerMessage, setLedgerMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const setTheme = useThemeStore((state) => state.setTheme);
  const setActiveBook = useActiveBookStore((state) => state.setActiveBook);
  const { user, logout } = useUserStore();

  useEffect(() => {
    const fetchCustomBooks = async () => {
      try {
        const list = await bookService.listMine();
        if (list && Array.isArray(list)) {
          const mapped = list.map((b, idx) => mapToBookshelfBook(b, idx));
          setCustomBooks(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch custom books:', err);
      }
    };
    fetchCustomBooks();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleUnreadUpdated = (data: { bookId: string; unreadMessageCount: number }) => {
      console.log('[Socket] unread:updated received:', data);
      setCustomBooks(prev => 
        prev.map(book => {
          if (book.id === data.bookId) {
            return {
              ...book,
              unreadMessageCount: data.unreadMessageCount,
            };
          }
          return book;
        })
      );
    };

    socket.on('unread:updated', handleUnreadUpdated);

    if (user && user.id) {
      console.log('[Socket] Joining user room:', user.id);
      socket.emit('user:join', user.id);
    }

    return () => {
      socket.off('unread:updated', handleUnreadUpdated);
    };
  }, [user]);

  const combinedBooks = customBooks;

  // Set initial selected detail book once books are loaded/available
  useEffect(() => {
    if (combinedBooks.length > 0) {
      if (!selectedBookDetail || !combinedBooks.some(b => b.id === selectedBookDetail.id)) {
        setSelectedBookDetail(combinedBooks[0]);
      }
    } else {
      setSelectedBookDetail(null);
    }
  }, [combinedBooks, selectedBookDetail]);

  const filteredBooks = combinedBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookClick = (book: BookshelfBook) => {
    setSelectedBookDetail(book);
    // Preview the theme immediately on the background!
    setTheme(book.theme);
  };

  const handleOpenBook = (book: BookshelfBook) => {
    setTheme(book.theme);
    setActiveBook({
      id: book.id,
      title: book.title,
      author: book.author,
      progressPercentage: Math.round((book.currentPage / book.totalPages) * 100),
      currentPage: book.currentPage,
      totalPages: book.totalPages,
      creatorId: book.creatorId,
      creator: book.creator,
    });
    onSelectBook(book);
  };

  const handleCreateSuccess = (newBook: any) => {
    setIsCreateModalOpen(false);
    const mapped = mapToBookshelfBook(newBook, customBooks.length);
    setCustomBooks((prev) => [...prev, mapped]);
    handleOpenBook(mapped);
  };

  const handleJoinSuccess = (joinedBook: any) => {
    setIsJoinModalOpen(false);
    const mapped = mapToBookshelfBook(joinedBook, customBooks.length);
    setCustomBooks((prev) => {
      if (prev.some(b => b.id === mapped.id)) return prev;
      return [...prev, mapped];
    });
    handleOpenBook(mapped);
  };

  const handleFormSuccess = (data: any) => {
    setLedgerMessage(`Thank you, ${data.name}. Your entry has been recorded in the library ledger.`);
    setTimeout(() => setLedgerMessage(null), 5000);
    setShowLedger(false);
  };

  return (
    <div id="bookshelf-landing" className="min-h-screen bg-paper-bg p-4 md:p-8 flex flex-col justify-between select-none relative font-sans text-ink-primary overflow-x-hidden">
      
      {/* Warm atmospheric reading-lamp spotlight glow (Volume 7 section 5) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(227,168,53,0.07)_0%,transparent_75%)] pointer-events-none z-0" />
      
      {/* Dynamic dust background styling and atmospheric details */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none" />
 
      {/* 1. Header Area: Classic Brass Plaque Nameplate */}
      <div className="max-w-5xl mx-auto w-full text-center mt-4 mb-8 relative z-10">
        <div className="inline-block px-8 py-6 rounded-md bg-gradient-to-b from-[#dfd5af] via-[#c29738] to-[#997320] shadow-book border-2 border-[#fffff2] relative">
          {/* Virtual screw heads */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#523d0c] shadow-inner" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#523d0c] shadow-inner" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#523d0c] shadow-inner" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#523d0c] shadow-inner" />
          
          <h1 className="text-xl md:text-3xl font-playfair font-bold tracking-widest text-[#2c1a04] uppercase drop-shadow-sm">
            The BookChat Circulating Library
          </h1>
          <p className="text-xs md:text-sm font-serif italic text-[#4a2e0a] mt-1 tracking-wide">
            Est. 1894 — Authorized Scribes & Custodians of the Digital Vault
          </p>
        </div>
 
        {/* Catalog Search & Ledger Plaque Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto bg-paper-surface/5 backdrop-blur-sm p-3 rounded-lg border border-paper-border/10">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink-light">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search Scribe Archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-md text-sm border border-paper-border/20 bg-paper-surface/10 text-paper-surface placeholder:text-paper-surface/40 focus:outline-none focus:border-accent-gold focus:bg-paper-surface/20 transition-all font-serif italic"
            />
          </div>
 
          <div className="flex flex-wrap gap-3 items-center">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-paper-surface/10 rounded-md border border-paper-border/10">
                <span className="w-2 h-2 rounded-full bg-[#599c75] animate-pulse animate-duration-1000" />
                <span className="text-[11px] font-serif text-paper-surface opacity-90">
                  Scribe: <span className="font-bold">{user.name || user.username || user.email}</span>
                </span>
                <button
                  onClick={() => logout()}
                  className="ml-1 text-[10px] text-accent-red font-bold hover:underline cursor-pointer uppercase tracking-wider"
                >
                  [Log Out]
                </button>
              </div>
            )}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-1.5 rounded bg-[#1b4d22] text-paper-surface font-semibold text-xs tracking-wider uppercase shadow-md hover:bg-[#22632b] transition-all border border-[#fbf9f4]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-accent-gold" />
              Create Book
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-1.5 rounded bg-[#9e1b32] text-paper-surface font-semibold text-xs tracking-wider uppercase shadow-md hover:bg-[#b2223a] transition-all border border-[#fbf9f4]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-accent-gold" />
              Join Book
            </button>
            <button
              onClick={() => setShowLedger(!showLedger)}
              className="px-4 py-1.5 rounded bg-[#5c3e16] hover:bg-[#6e4a1a] text-paper-surface font-semibold text-xs tracking-wider uppercase shadow-md transition-all border border-[#fbf9f4]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-accent-gold" />
              Sign Guest Ledger
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-paper-surface/60 text-xs">
              <BookMarked className="w-4 h-4 text-accent-gold" />
              <span>{combinedBooks.length} Volumes Active</span>
            </div>
          </div>
        </div>

        {ledgerMessage && (
          <div className="mt-4 p-3 bg-status-success-bg text-status-success border border-status-success-border rounded-md text-xs font-serif max-w-md mx-auto animate-fade-in shadow-paper">
            {ledgerMessage}
          </div>
        )}
      </div>

      {/* 2. Ledger Drawer (Collapsible form area) */}
      {showLedger && (
        <div className="max-w-md mx-auto w-full mb-8 relative z-20 animate-slide-down">
          <div className="relative p-1 bg-[#1e130a] rounded-lg shadow-book border border-accent-gold/30">
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={() => setShowLedger(false)} 
                className="text-paper-surface/60 hover:text-paper-surface p-1 text-xs font-serif"
              >
                ✕ Close
              </button>
            </div>
            <FormExample onSubmitSuccess={handleFormSuccess} />
          </div>
        </div>
      )}

      {/* 3. Main Shelf & Book Display Area */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center my-6 relative z-10">
        
        {/* Bookshelf Construction */}
        <div className="relative py-8 px-4 md:px-12 bg-black/10 rounded-2xl border border-white/5 shadow-depth-val">
          
          {/* Horizontal Shelf Level 1 */}
          <div className="grid grid-cols-5 gap-3 md:gap-6 justify-items-center items-end min-h-[220px] md:min-h-[280px] pb-1 relative">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => {
                const isSelected = selectedBookDetail?.id === book.id;
                return (
                  <div
                    key={book.id}
                    onClick={() => handleBookClick(book)}
                    className={`relative group cursor-pointer transition-all duration-300 origin-bottom select-none flex flex-col items-center ${
                      isSelected 
                        ? '-translate-y-6 scale-105 z-20' 
                        : 'hover:-translate-y-4 hover:scale-[1.02] z-10'
                    }`}
                    style={{
                      height: '100%',
                      maxWidth: '85px',
                      width: '100%',
                    }}
                  >
                    {/* Glowing halo behind selected book */}
                    {isSelected && (
                      <div className="absolute -inset-4 bg-white/5 rounded-lg blur-xl animate-pulse pointer-events-none" />
                    )}

                    {/* 3D Book Spine representation */}
                    <div 
                      className={`w-9 md:w-14 h-48 md:h-64 rounded-t-[3px] rounded-b-[1px] relative shadow-book transition-shadow duration-300 ${book.spineBg} border-y-4 ${book.accentColor}`}
                    >
                      {/* Spine Curvature shading overlay */}
                      <div className="absolute inset-y-0 left-0 w-1 md:w-2 bg-white/10" />
                      <div className="absolute inset-y-0 right-0 w-1.5 md:w-2.5 bg-black/40" />

                      {/* Gold Foil Gilding Lines */}
                      <div className="absolute top-4 inset-x-0 h-[1.5px] bg-[#d4af37]/60" />
                      <div className="absolute top-5 inset-x-0 h-[1.5px] bg-[#d4af37]/60" />
                      <div className="absolute bottom-6 inset-x-0 h-[1.5px] bg-[#d4af37]/60" />
                      <div className="absolute bottom-7 inset-x-0 h-[1.5px] bg-[#d4af37]/60" />

                      {/* Volume Number (Vertical spine detail) */}
                      <div className="absolute top-8 inset-x-0 text-center text-[10px] md:text-xs font-serif text-[#d4af37] font-bold opacity-85">
                        VOL
                      </div>
                      <div className="absolute top-12 inset-x-0 text-center text-[10px] md:text-xs font-serif text-paper-surface opacity-75">
                        {book.volumeNumber || 'I'}
                      </div>

                      {/* Vertical Book Title on Spine */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none" style={{ height: '70%', top: '15%' }}>
                        <span className={`rotate-90 whitespace-nowrap text-[8px] md:text-[11px] font-playfair font-bold uppercase tracking-wider ${book.textColor}`}>
                          {book.title.split(': ')[0]}
                        </span>
                      </div>

                      {/* Ribbon bookmark hanging down past shelf */}
                      {isSelected && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-accent-red rounded-b-sm border-r border-black/20 animate-pulse" />
                      )}

                      {/* Unread Message Count Badge on Book Spine */}
                      {book.unreadMessageCount !== undefined && book.unreadMessageCount > 0 && (
                        <div className="absolute -top-2 -right-1 md:-right-2 bg-accent-gold text-[#2c1a04] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-serif font-bold shadow-sticky border border-[#dfd5af]">
                          {book.unreadMessageCount > 99 ? '99+' : book.unreadMessageCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-5 flex flex-col items-center justify-center py-12 text-center space-y-6 max-w-lg mx-auto animate-fade-in font-serif w-full">
                {/* Artistic Sepia SVG: Feather quill, inkwell, and closed leather-bound journal */}
                <div className="relative w-36 h-36 flex items-center justify-center bg-black/5 rounded-full border border-[#dfd5af]/20">
                  {/* Visual Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(227,168,53,0.15)_0%,transparent_70%)] animate-pulse" />
                  
                  <svg className="w-24 h-24 text-[#c29738] drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Closed Book */}
                    <path d="M25 65 h45 v12 H25 z" fill="#3a1e12" stroke="#c29738" strokeWidth="2" />
                    <path d="M25 65 c-3 0 -5 2 -5 5 s2 5 5 5" fill="none" stroke="#c29738" strokeWidth="2" />
                    {/* Pages edge of the book */}
                    <path d="M70 67 h3 v8 h-3 z" fill="#fbf9f4" />
                    
                    {/* Ink Bottle (Inkwell) */}
                    <path d="M60 45 h16 v12 H60 z" fill="#1e231a" stroke="#c29738" strokeWidth="1.5" />
                    <path d="M64 45 V41 h8 v4" stroke="#c29738" strokeWidth="1.5" />
                    {/* Liquid inside */}
                    <path d="M62 51 h12 v4 H62 z" fill="#c29738" opacity="0.3" />
                    
                    {/* Feather Quill */}
                    <path d="M72 43 C65 30 45 20 25 35 C38 35 48 45 53 58" stroke="#c29738" strokeWidth="1.5" />
                    <path d="M25 35 L15 45 M30 33 L23 40 M36 32 L31 37 M43 33 L39 37" stroke="#c29738" strokeWidth="1" />
                    {/* Quill Nib */}
                    <path d="M15 45 L11 49 L16 48 z" fill="#c29738" />
                    
                    {/* Stars/Sparkles around */}
                    <circle cx="35" cy="18" r="1.5" fill="#ffd43b" />
                    <circle cx="80" cy="30" r="1" fill="#ffd43b" />
                  </svg>
                </div>

                <div className="space-y-2 px-4">
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-[#dfd5af] tracking-wide uppercase">
                    An Empty Shelf Awaits
                  </h3>
                  <p className="text-xs md:text-sm text-[#e6dfd3] italic max-w-sm mx-auto leading-relaxed opacity-80">
                    "No bound chronicles rest upon your shelf. Scribe, the parchment lies clean, and the ink remains undisturbed."
                  </p>
                </div>

                {/* Action buttons inside empty state */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md select-none pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded bg-[#1b4d22] hover:bg-[#22632b] text-paper-surface font-semibold text-xs tracking-wider uppercase shadow-md transition-all border border-[#fbf9f4]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-accent-gold" />
                    Bind New Volume
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded bg-[#9e1b32] hover:bg-[#b2223a] text-paper-surface font-semibold text-xs tracking-wider uppercase shadow-md transition-all border border-[#fbf9f4]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-accent-gold" />
                    Unseal Existing Volume
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wooden Plank Base (Physical Shelf Ledge) */}
          <div className="h-4 md:h-6 w-full rounded-md bg-gradient-to-b from-[#8a532d] via-[#663b1d] to-[#482813] border-t border-[#dfd5af]/20 shadow-book relative">
            {/* Wooden shelf grain and thickness representation */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-white/10" />
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/40" />
          </div>

          {/* Under-shelf shadow depth */}
          <div className="h-6 bg-gradient-to-b from-black/20 to-transparent -mt-1 w-full" />
        </div>

      </div>

      {/* 4. Book Inspector Display Card (Ages, Synopses, Authors) */}
      <div className="max-w-4xl mx-auto w-full mt-4 mb-8 relative z-10">
        {selectedBookDetail ? (
          <div className="p-6 md:p-8 rounded-lg bg-paper-surface shadow-book border border-paper-border relative overflow-hidden transition-all duration-300">
            {/* Paper textured background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.01)_0%,transparent_100%)] pointer-events-none" />
            <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none">
              <BookMarked className="w-64 h-64 text-ink-primary" />
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold font-serif">
                    Scribe Archives &bull; {selectedBookDetail.published}
                  </span>
                  <span className="h-3 w-[1px] bg-paper-border" />
                  <div className="flex items-center gap-1 text-xs text-ink-muted">
                    <Users className="w-3.5 h-3.5 text-accent-green" />
                    <span>{selectedBookDetail.readersActive} Scribes Reading</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-playfair font-bold text-ink-primary tracking-tight">
                    {selectedBookDetail.title}
                  </h2>
                  <p className="text-sm md:text-md italic font-serif text-ink-muted mt-1">
                    {selectedBookDetail.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-paper-border">
                  <p className="text-sm text-ink-secondary leading-relaxed font-serif">
                    {selectedBookDetail.synopsis}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-serif text-ink-muted pt-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-accent-red" />
                    <span>By {selectedBookDetail.author}</span>
                  </div>
                </div>

                {user && selectedBookDetail.creatorId === user.id && (
                  <div className="pt-4 border-t border-paper-border/60 animate-fade-in">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1.5 mb-2 font-serif">
                      <Sparkles className="w-3 h-3 text-accent-gold" />
                      Adjust Volume Spine Color (Custodian Privilege)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { key: 'burgundy', label: 'Burgundy', bg: 'bg-gradient-to-r from-[#5c201e] to-[#85302c]' },
                        { key: 'forest-green', label: 'Forest Green', bg: 'bg-gradient-to-r from-[#1b2a1a] to-[#2d422b]' },
                        { key: 'navy', label: 'Navy Blue', bg: 'bg-gradient-to-r from-[#0d1b2a] to-[#1b263b]' },
                        { key: 'warm-brown', label: 'Warm Brown', bg: 'bg-gradient-to-r from-[#421d12] to-[#612c1b]' },
                        { key: 'slate-blue', label: 'Slate Blue', bg: 'bg-gradient-to-r from-[#17253d] to-[#243a5e]' },
                      ].map((item) => {
                        const isCurrent = (selectedBookDetail.spineBg && item.key === 'burgundy' && selectedBookDetail.spineBg.includes('#5c201e')) ||
                                          (selectedBookDetail.spineBg && item.key === 'forest-green' && selectedBookDetail.spineBg.includes('#1b2a1a')) ||
                                          (selectedBookDetail.spineBg && item.key === 'navy' && selectedBookDetail.spineBg.includes('#0d1b2a')) ||
                                          (selectedBookDetail.spineBg && item.key === 'warm-brown' && selectedBookDetail.spineBg.includes('#421d12')) ||
                                          (selectedBookDetail.spineBg && item.key === 'slate-blue' && selectedBookDetail.spineBg.includes('#17253d'));

                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={async () => {
                              audioService.playPaperShuffle();
                              try {
                                const updatedBook = await bookService.update(selectedBookDetail.id, { coverColor: item.key });
                                // Map the updated book back
                                const index = customBooks.findIndex(b => b.id === selectedBookDetail.id);
                                const mapped = mapToBookshelfBook(updatedBook, index >= 0 ? index : 0);
                                setCustomBooks(prev => prev.map(b => b.id === selectedBookDetail.id ? mapped : b));
                                setSelectedBookDetail(mapped);
                              } catch (err) {
                                console.error('Failed to update book spine:', err);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-serif transition-all duration-200 cursor-pointer focus:outline-none
                              ${isCurrent 
                                ? 'border-[#9e1b32] bg-[#9e1b32]/5 font-bold text-ink-primary shadow-sm scale-105' 
                                : 'border-paper-border hover:border-accent-gold/40 text-ink-muted'
                              }`}
                            title={`Re-bind with ${item.label} spine color`}
                          >
                            <span className={`w-3 h-3 rounded-full border border-black/10 shadow-inner shrink-0 ${item.bg}`} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Physical Open Book Action Panel */}
              <div className="md:w-64 flex flex-col justify-center items-stretch bg-paper-surface-dim p-4 rounded-md border border-paper-border/60 text-center">
                <div className="text-xs uppercase tracking-widest text-ink-muted font-bold mb-3 font-serif">
                  Selected Ledger
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-ink-muted mb-1 font-serif">
                    <span>Reading Progress</span>
                    <span>{Math.round((selectedBookDetail.currentPage / selectedBookDetail.totalPages) * 100)}%</span>
                  </div>
                  <div className="w-full bg-paper-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent-red h-full transition-all duration-500"
                      style={{ width: `${(selectedBookDetail.currentPage / selectedBookDetail.totalPages) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBook(selectedBookDetail)}
                  className="w-full py-3 px-4 rounded bg-ink-primary text-paper-surface hover:bg-ink-secondary hover:shadow-hover font-playfair font-semibold text-sm uppercase tracking-widest border border-ink-primary hover:border-accent-gold hover:text-accent-gold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <BookMarked className="w-4 h-4 text-accent-gold" />
                  Open Circulating Book
                </button>
                <span className="text-[10px] font-serif text-ink-light italic mt-2">
                  Double-spread active binding layout
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-paper-surface/40 font-serif italic text-sm">
            Select a volume from the shelf above to view its contents...
          </div>
        )}
      </div>

      {/* 5. Elegant Library Footer */}
      <footer className="w-full text-center py-4 text-paper-surface/30 text-[11px] font-serif border-t border-paper-surface/5 mt-auto relative z-10">
        <p>BookChat Archival Systems &bull; Powered by TypeScript &amp; Next.js App Router</p>
        <p className="mt-0.5 opacity-60">All leather spines, gold bindings, and page layouts preserve library preservation standards.</p>
      </footer>

      {/* 6. Dynamic Scribing Modal */}
      <CreateBookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 7. Join Chronicle Modal */}
      <JoinBookModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}
