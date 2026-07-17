'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNotificationsStore } from '../stores/notifications-store';
import { useActiveBookStore } from '../stores/active-book-store';
import { useUserStore } from '../stores/user-store';
import { apiClient } from '../lib/api-client';
import { usePrefersReducedMotion, usePaperDrop } from '../animations';
import { X, CornerDownLeft, Bell, Sparkles, Clock, Layers } from 'lucide-react';
import { getSocket } from '../lib/socket';
import gsap from 'gsap';
import { audioService } from '../services/audio-service';


// Design Token mappings for sticky notes from Volume 13 tokens.css
const COLOR_CONFIGS = {
  yellow: {
    bgClass: 'bg-sticky-yellow-bg',
    inkClass: 'text-sticky-yellow-ink',
    borderClass: 'border-sticky-yellow-border',
    vars: {
      '--sticky-bg': 'var(--sticky-yellow-bg, #fffbeb)',
      '--sticky-ink': 'var(--sticky-yellow-ink, #78350f)',
      '--sticky-border': 'var(--sticky-yellow-border, #fde68a)',
    }
  },
  pink: {
    bgClass: 'bg-sticky-pink-bg',
    inkClass: 'text-sticky-pink-ink',
    borderClass: 'border-sticky-pink-border',
    vars: {
      '--sticky-bg': 'var(--sticky-pink-bg, #fdf2f8)',
      '--sticky-ink': 'var(--sticky-pink-ink, #9d174d)',
      '--sticky-border': 'var(--sticky-pink-border, #fbcfe8)',
    }
  },
  blue: {
    bgClass: 'bg-sticky-blue-bg',
    inkClass: 'text-sticky-blue-ink',
    borderClass: 'border-sticky-blue-border',
    vars: {
      '--sticky-bg': 'var(--sticky-blue-bg, #f0f9ff)',
      '--sticky-ink': 'var(--sticky-blue-ink, #0369a1)',
      '--sticky-border': 'var(--sticky-blue-border, #bae6fd)',
    }
  },
  mint: {
    bgClass: 'bg-sticky-green-bg',
    inkClass: 'text-sticky-green-ink',
    borderClass: 'border-sticky-green-border',
    vars: {
      '--sticky-bg': 'var(--sticky-green-bg, #f0dfa)',
      '--sticky-ink': 'var(--sticky-green-ink, #15803d)',
      '--sticky-border': 'var(--sticky-green-border, #bbf7d0)',
    }
  },
  peach: {
    bgClass: 'bg-[#fff7ed]',
    inkClass: 'text-[#c2410c]',
    borderClass: 'border-[#ffedd5]',
    vars: {
      '--sticky-bg': '#fff7ed',
      '--sticky-ink': '#c2410c',
      '--sticky-border': '#ffedd5',
    }
  }
};

import { AppNotification } from '../types';

interface StickyNoteProps {
  notification: AppNotification;
  index: number;
}

/**
 * Individual Sticky Note component with physics drop-in, peel dismiss, hover lift,
 * folded corner, and handwritten block-font layout.
 */
function StickyNote({ notification, index }: StickyNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const isReduced = usePrefersReducedMotion();
  const { updateLifecycleState, markAsRead, clearNotification } = useNotificationsStore();
  const { activeBook, setActiveBook, updateProgress } = useActiveBookStore();

  // Pick a color theme or fallback to yellow
  const colorKey = notification.color || 'yellow';
  const colorSpec = COLOR_CONFIGS[colorKey] || COLOR_CONFIGS.yellow;

  // Track organic rotation tilt (randomized so notes hang slightly differently)
  const [tilt] = useState(() => (Math.random() - 0.5) * 8); // -4deg to +4deg

  // 1. Drop-in gravity / flutter animation on mount using hook from Phase 7 (usePaperDrop)
  usePaperDrop(noteRef, {
    active: true,
    weight: 'normal',
    tilt: tilt,
    delay: index * 0.15, // Cascaded fall timing for stack behavior
    onComplete: () => {
      // Transition lifecycle to displayed
      if (notification.lifecycleState !== 'displayed' && notification.lifecycleState !== 'read' && notification.lifecycleState !== 'archived') {
        updateLifecycleState(notification.id, 'displayed');
      }
    }
  });

  // 2. Physical hover effect (lifts lower edge up with 3D shadow depth)
  useEffect(() => {
    const el = noteRef.current;
    if (!el || isReduced) return;

    const onMouseEnter = () => {
      gsap.to(el, {
        rotateX: -15, // Lift bottom edge slightly towards user
        y: -4,
        scale: 1.02,
        boxShadow: '6px 12px 20px rgba(0,0,0,0.18)',
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        y: 0,
        scale: 1,
        boxShadow: '2px 4px 10px rgba(0,0,0,0.12)',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isReduced]);

  // 3. High-fidelity peel-off and drop-away dismiss animation
  const handleDismiss = React.useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering open thread action
    }
    const el = noteRef.current;
    if (!el) return;
    
    // Set status to archived
    updateLifecycleState(notification.id, 'archived');

    if (isReduced) {
      gsap.to(el, {
        opacity: 0,
        scale: 0.95,
        duration: 0.25,
        onComplete: () => clearNotification(notification.id),
      });
      return;
    }

    // Physical peel and drop
    const tl = gsap.timeline({
      onComplete: () => clearNotification(notification.id),
    });

    tl.to(el, {
      transformOrigin: 'left top',
      rotateX: -35,
      rotateY: -20,
      skewX: 8,
      y: -6,
      boxShadow: '10px 15px 30px rgba(0,0,0,0.22)',
      duration: 0.3,
      ease: 'power1.out',
    })
    .to(el, {
      y: window.innerHeight + 150,
      rotate: tilt + (Math.random() - 0.5) * 50,
      scale: 0.88,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.in',
    });
  }, [notification.id, isReduced, tilt, updateLifecycleState, clearNotification]);

  // 5. Auto-dismiss after 6 seconds for transient toast behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [handleDismiss]);

  // 4. "Expand into chat" interaction on tapping the sticky note body
  const handleExpand = () => {
    // Set read state
    markAsRead(notification.id);

    if (notification.conversationId) {
      // It's a chat message notification!
      const isDirect = !notification.page;
      const targetPage = notification.page || 12;

      if (isDirect) {
        // Direct chat!
        const setTargetDirectChat = useActiveBookStore.getState().setTargetDirectChat;
        setTargetDirectChat({
          id: notification.conversationId,
          recipientId: notification.senderId || '',
          recipientName: notification.senderName || '',
        });

        if (activeBook) {
          if (activeBook.currentPage === 1) {
            updateProgress(12);
          }
        } else {
          // If on the shelf, open specified book (or default vol-2)
          const VOL_MAP: Record<string, { title: string; author: string }> = {
            'vol-2': { title: 'Tactile Shadows & Depth', author: 'Scribe Emma & Aryan' },
            'vol-3': { title: 'Gilded Margins & Leaf', author: 'Scribe Emma & Aryan' },
            'vol-6': { title: 'Scent of Oakgall Ink', author: 'Scribe Emma & Aryan' },
            'vol-10': { title: 'Parchment Tooth & Texture', author: 'Scribe Emma & Aryan' },
            'vol-13': { title: 'Binding & Structural Ribs', author: 'Scribe Emma & Aryan' },
          };
          const details = VOL_MAP[notification.bookId || 'vol-2'] || { title: 'Tactile Shadows & Depth', author: 'Scribe Emma & Aryan' };
          setActiveBook({
            id: notification.bookId || 'vol-2',
            title: details.title,
            author: details.author,
            currentPage: 12, // open direct chat page
            totalPages: 150,
            progressPercentage: Math.round((12 / 150) * 100),
          });
        }
      } else {
        // Group / Page chat!
        if (activeBook) {
          updateProgress(targetPage);
        } else {
          const VOL_MAP: Record<string, { title: string; author: string }> = {
            'vol-2': { title: 'Tactile Shadows & Depth', author: 'Scribe Emma & Aryan' },
            'vol-3': { title: 'Gilded Margins & Leaf', author: 'Scribe Emma & Aryan' },
            'vol-6': { title: 'Scent of Oakgall Ink', author: 'Scribe Emma & Aryan' },
            'vol-10': { title: 'Parchment Tooth & Texture', author: 'Scribe Emma & Aryan' },
            'vol-13': { title: 'Binding & Structural Ribs', author: 'Scribe Emma & Aryan' },
          };
          const details = VOL_MAP[notification.bookId || 'vol-2'] || { title: 'Tactile Shadows & Depth', author: 'Scribe Emma & Aryan' };
          setActiveBook({
            id: notification.bookId || 'vol-2',
            title: details.title,
            author: details.author,
            currentPage: targetPage,
            totalPages: 150,
            progressPercentage: Math.round((targetPage / 150) * 100),
          });
        }
      }
    } else {
      // Standard notification
      const targetPage = notification.page || 12;
      if (activeBook) {
        updateProgress(targetPage);
      } else {
        setActiveBook({
          id: 'vol-2',
          title: 'Tactile Shadows & Depth',
          author: 'Scribe Emma & Aryan',
          currentPage: targetPage,
          totalPages: 150,
          progressPercentage: Math.round((targetPage / 150) * 100),
        });
      }
    }
  };

  // Format timestamp nicely for our vintage clock display
  const timeStr = new Date(notification.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      id={`sticky-note-${notification.id}`}
      ref={noteRef}
      onClick={handleExpand}
      className={`relative w-68 p-4 border rounded-sm shadow-sticky cursor-pointer select-none pointer-events-auto transition-shadow ${colorSpec.bgClass} ${colorSpec.inkClass} ${colorSpec.borderClass}`}
      style={{
        ...colorSpec.vars,
        transformOrigin: 'center top',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
      } as React.CSSProperties}
    >
      {/* Small paper corner fold overlay at bottom right */}
      <div
        className="absolute bottom-0 right-0 w-3.5 h-3.5 shadow-sm"
        style={{
          background: `linear-gradient(225deg, transparent 50%, var(--sticky-border) 50%)`,
          borderTopLeftRadius: '2px',
        }}
      />

      {/* Pin design representation at top center */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent-gold rounded-full shadow-inner border border-black/15 flex items-center justify-center">
        <div className="w-1 h-1 bg-[#8a1523] rounded-full" />
      </div>

      {/* Dismiss Button (peel away icon/trigger) */}
      <button
        onClick={handleDismiss}
        className="absolute top-1.5 right-1.5 p-0.5 rounded-full hover:bg-black/5 opacity-50 hover:opacity-100 transition-all focus:outline-none"
        title="Peel Off Sticky Note"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Content layout */}
      <div className="space-y-2 mt-1">
        {/* Handwritten Label/Title */}
        <h4 className="font-['Architects_Daughter'] font-bold text-xs uppercase tracking-wider leading-none flex items-center gap-1">
          <Bell className="w-3 h-3 inline" />
          {notification.title}
        </h4>

        {/* Note Body */}
        <p className="font-['Architects_Daughter'] text-xs leading-relaxed font-semibold">
          {notification.message}
        </p>

        {/* Context metadata & state indicators */}
        <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[9px] opacity-75 font-serif font-semibold uppercase tracking-widest italic select-none">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {timeStr}
          </span>
          
          <div className="flex gap-1 items-center">
            {notification.page && (
              <span className="bg-black/5 px-1 rounded-sm text-[8px]">
                Pg. {notification.page}
              </span>
            )}
            <span className="bg-black/5 px-1 rounded-sm text-[8px] text-[#8f2d1b] animate-pulse">
              {notification.lifecycleState}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Notifications system overlay containing StickyNote stacking and
 * connection to real-time Socket.IO trigger events.
 */
export function StickyNoteNotifications() {
  const { notifications, addNotification } = useNotificationsStore();
  const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const { activeBook } = useActiveBookStore();

  // Filter out read or archived notes from actively falling list to avoid cluttering the board
  const activeStickyNotes = notifications.filter(
    (n) => !n.read && n.lifecycleState !== 'archived'
  );

  // Proactively join all conversation rooms when browsing the shelf
  useEffect(() => {
    const socket = getSocket();
    const currentUser = useUserStore.getState().user;
    if (!currentUser || activeBook) return;

    const joinAllActiveRooms = async () => {
      try {
        const res = await apiClient<any>('/api/chats');
        const conversations = res?.data || res || [];
        conversations.forEach((c: any) => {
          socket.emit('room:join', `chat:${c.id}`);
          console.log(`[Socket] Proactively joined conversation room on shelf: chat:${c.id}`);
        });
      } catch (err) {
        console.warn('[Socket] Failed to proactively join rooms on shelf:', err);
      }
    };

    joinAllActiveRooms();
  }, [activeBook]);

  // Listen to message:new when browsing the shelf
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessageOnShelf = (data: { conversationId: string; message: any }) => {
      const currentUserId = useUserStore.getState().user?.id;
      if (activeBook || !currentUserId) return;
      if (data.message.senderId === currentUserId) return;

      const senderName = data.message.sender?.profile?.displayName || 
                         data.message.sender?.username || 
                         `Scribe ${data.message.senderId.substring(0, 4)}`;
      const contentPreview = data.message.content || 'Sent a message.';

      const colors: ('yellow' | 'pink' | 'blue' | 'mint' | 'peach')[] = ['yellow', 'pink', 'blue', 'mint', 'peach'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // Play skeuomorphic sound
      audioService.playStickyFall();

      // Native browser notification if tab is unfocused
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        } else if (Notification.permission === 'granted' && document.visibilityState === 'hidden') {
          new Notification(`New Message from ${senderName}`, {
            body: contentPreview,
          });
        }
      }

      addNotification({
        title: `Message from ${senderName}`,
        message: contentPreview,
        type: 'info',
        color: randomColor,
        conversationId: data.conversationId,
        bookId: data.message.conversation?.bookId || 'vol-2',
        senderId: data.message.senderId,
        senderName: senderName,
        lifecycleState: 'delivered',
      });
    };

    socket.on('message:new', handleNewMessageOnShelf);

    return () => {
      socket.off('message:new', handleNewMessageOnShelf);
    };
  }, [activeBook, addNotification]);

  // 1. Initialize real-time Socket.IO Connection
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log('[Socket] Connection established successfully');
      setSocketStatus('connected');
    };

    const handleDisconnect = () => {
      console.log('[Socket] Connection terminated');
      setSocketStatus('disconnected');
    };

    const handleNewNotification = (data: any) => {
      console.log('[Socket] "notification:new" socket event received:', data);
      
      const colors: ('yellow' | 'pink' | 'blue' | 'mint' | 'peach')[] = ['yellow', 'pink', 'blue', 'mint', 'peach'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Play skeuomorphic sound
      audioService.playStickyFall();

      // Push into state engine
      addNotification({
        title: data.title || 'Scribe Dispatch',
        message: data.message || 'An annotation was inscribed on the ledger.',
        type: data.type || 'info',
        color: data.color || randomColor,
        page: data.page || Math.floor(Math.random() * 40) + 5,
        lifecycleState: 'delivered', // Step 2: Delivered
      });
    };

    if (socket.connected) {
      setSocketStatus('connected');
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('notification:new', handleNewNotification);
    };
  }, [addNotification]);

  return (
    <>
      {/* 1. Bullet board sidebar stack layer container */}
      <div 
        style={{ zIndex: 9999 }}
        className="fixed right-6 top-24 flex flex-col gap-4 max-h-[80vh] w-72 overflow-y-visible pointer-events-none select-none"
      >
        {activeStickyNotes.map((notification, idx) => (
          <StickyNote
            key={notification.id}
            notification={notification}
            index={idx}
          />
        ))}
      </div>
    </>
  );
}
