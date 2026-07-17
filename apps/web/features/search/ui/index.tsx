'use client';

import React from 'react';
import { useSearch, highlightText } from '../hooks';
import { audioService } from '../../../services/audio-service';
import { 
  Search, 
  BookOpen, 
  Bookmark as RibbonIcon, 
  FileText, 
  Quote,
  ArrowRight
} from 'lucide-react';

interface SearchFieldProps {
  chatThreads: any[];
  bookmarks: any[];
  annotations: any[];
  quotes: any[];
  onPageSelect: (pageNumber: number) => void;
}

export function SearchField({
  chatThreads,
  bookmarks,
  annotations,
  quotes,
  onPageSelect
}: SearchFieldProps) {
  const { query, setQuery, results, isSearching } = useSearch({
    chatThreads,
    bookmarks,
    annotations,
    quotes
  });

  const handleResultClick = (pageNum: number) => {
    onPageSelect(pageNum);
    audioService.playPageFlip();
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'inscription') return <BookOpen className="w-3.5 h-3.5 text-accent-blue" />;
    if (category === 'bookmark') return <RibbonIcon className="w-3.5 h-3.5 text-accent-gold" />;
    if (category === 'marginalia') return <FileText className="w-3.5 h-3.5 text-accent-red" />;
    if (category === 'quote') return <Quote className="w-3.5 h-3.5 text-accent-green" />;
    return <Search className="w-3.5 h-3.5 text-ink-muted" />;
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'inscription') return 'Inscription';
    if (category === 'bookmark') return 'Ribbon';
    if (category === 'marginalia') return 'Marginalia';
    if (category === 'quote') return 'Quote Card';
    return 'Match';
  };

  return (
    <div id="search-notebook" className="space-y-4 font-serif text-ink-primary select-none animate-fade-in pt-1.5">
      
      {/* Search Input Box */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-muted/50" />
        <input
          type="text"
          id="search-quill-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Play physical pencil-scratch sounds as you type
            if (Math.random() > 0.4) {
              audioService.playPenScratch(0.04, 1300);
            }
          }}
          className="w-full bg-paper-surface p-2 pl-9 rounded border border-paper-border text-xs focus:outline-none focus:border-accent-gold font-serif placeholder:italic placeholder:text-ink-muted/50 text-ink-primary"
          placeholder="Type keywords to browse notebook..."
        />
      </div>

      {/* Results panel appearing naturally */}
      <div className="space-y-2">
        {!isSearching ? (
          /* Empty / Hint State */
          <div className="p-6 text-center border border-dashed border-paper-border/70 rounded bg-paper-surface-dim/30 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-[#8f7d61]/40 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-ink-secondary">Natural Ledger Indexing</p>
              <p className="text-[10px] text-ink-muted italic leading-relaxed mt-1">
                Enter queries to trace discussions, golden ribbons, handwritten marginalia, and index quotes across all pages instantly.
              </p>
            </div>
          </div>
        ) : results.length === 0 ? (
          /* No Results State */
          <div className="p-6 text-center border border-dashed border-status-error-border rounded bg-status-error-bg/20">
            <p className="text-xs font-bold text-accent-red">No Ledger Matches</p>
            <p className="text-[10px] text-ink-muted italic mt-1 leading-normal">
              No matching inscriptions or ribbons were carved into this book's vellum under "{query}".
            </p>
          </div>
        ) : (
          /* Active Results List */
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[9px] uppercase tracking-widest font-bold text-accent-gold">
              <span>Search Matches</span>
              <span>{results.length} Foliations</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-0.5">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  id={`search-result-${r.id}`}
                  onClick={() => handleResultClick(r.pageNumber)}
                  className="w-full p-2.5 rounded border border-paper-border/60 bg-paper-surface hover:bg-paper-surface-dim/40 hover:border-accent-gold/45 text-left transition-all flex flex-col space-y-1 relative shadow-sm group cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-gold"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-ink-secondary/70 flex items-center gap-1">
                      {getCategoryIcon(r.category)}
                      {getCategoryLabel(r.category)}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[#1e130a]/10 px-1.5 py-0.5 rounded text-ink-primary group-hover:bg-[#1e130a] group-hover:text-[#fdfaf2] transition-colors flex items-center gap-1">
                      Page {r.pageNumber}
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  <p className="text-[11px] font-serif leading-relaxed text-ink-primary italic line-clamp-2">
                    "{highlightText(r.snippet, query)}"
                  </p>

                  {(r.author || r.date) && (
                    <div className="flex justify-between text-[8px] uppercase tracking-wider text-ink-muted/80 pt-0.5">
                      <span>{r.author ? `Scribed by ${r.author}` : ''}</span>
                      <span>{r.date || ''}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
