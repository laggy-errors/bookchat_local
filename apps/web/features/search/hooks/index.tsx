'use client';

import React, { useState, useMemo } from 'react';

export interface SearchResultMatch {
  id: string;
  category: 'inscription' | 'bookmark' | 'marginalia' | 'quote';
  title: string;
  snippet: string;
  pageNumber: number;
  author?: string;
  date?: string;
}

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-accent-gold/30 text-ink-primary font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function useSearch({
  chatThreads = [],
  bookmarks = [],
  annotations = [],
  quotes = []
}: {
  chatThreads?: any[];
  bookmarks?: any[];
  annotations?: any[];
  quotes?: any[];
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: SearchResultMatch[] = [];

    // 1. Search across Inscriptions (Folio Chat Messages)
    chatThreads.forEach((chapter: any) => {
      if (chapter.threads && Array.isArray(chapter.threads)) {
        chapter.threads.forEach((thread: any) => {
          if (thread.messages && Array.isArray(thread.messages)) {
            thread.messages.forEach((msg: any) => {
              const text = msg.text || '';
              const author = msg.author || '';
              
              if (text.toLowerCase().includes(q) || author.toLowerCase().includes(q)) {
                matches.push({
                  id: `msg-${msg.id}`,
                  category: 'inscription',
                  title: `Folio Inscription by ${author}`,
                  snippet: text,
                  pageNumber: thread.page || 1,
                  author: author,
                  date: msg.timestamp,
                });
              }
            });
          }
        });
      }
    });

    // 2. Search across Ribbon Bookmarks
    bookmarks.forEach((b: any) => {
      const label = b.label || '';
      if (label.toLowerCase().includes(q)) {
        matches.push({
          id: `bm-${b.id}`,
          category: 'bookmark',
          title: `Golden Ribbon Bookmark`,
          snippet: label,
          pageNumber: b.page || 1,
        });
      }
    });

    // 3. Search across Marginalia (Annotations)
    annotations.forEach((ann: any) => {
      const note = ann.note || '';
      if (note.toLowerCase().includes(q)) {
        matches.push({
          id: `ann-${ann.id}`,
          category: 'marginalia',
          title: `Handwritten Marginalia`,
          snippet: note,
          pageNumber: ann.pageNumber || 1,
          date: new Date(ann.createdAt).toLocaleDateString(),
        });
      }
    });

    // 4. Search across Filed Quotes
    quotes.forEach((qt: any) => {
      const content = qt.content || '';
      const source = qt.source || '';
      if (content.toLowerCase().includes(q) || source.toLowerCase().includes(q)) {
        matches.push({
          id: `qt-${qt.id}`,
          category: 'quote',
          title: `Index Quote Card`,
          snippet: content,
          pageNumber: qt.pageNumber || 1,
          author: source,
          date: new Date(qt.createdAt).toLocaleDateString(),
        });
      }
    });

    return matches;
  }, [query, chatThreads, bookmarks, annotations, quotes]);

  return {
    query,
    setQuery,
    results,
    isSearching: !!query.trim(),
  };
}
