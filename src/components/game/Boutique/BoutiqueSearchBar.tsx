'use client';

import { Search, X } from 'lucide-react';

interface BoutiqueSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount?: number;
}

export function BoutiqueSearchBar({ query, onQueryChange, resultCount }: BoutiqueSearchBarProps) {
  const isSearchMode = query.trim().length >= 2;

  return (
    <div className="relative flex items-center">
      <Search size={14} className="absolute left-3 text-stone-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Rechercher une variété..."
        className="w-full pl-9 pr-8 py-2 text-xs font-bold rounded-xl border-2 border-stone-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-stone-300"
      />
      {query && (
        <button
          onClick={() => onQueryChange('')}
          className="absolute right-2 p-0.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X size={12} />
        </button>
      )}
      {isSearchMode && resultCount !== undefined && (
        <span className="absolute right-8 text-[9px] font-black text-stone-400">
          {resultCount}
        </span>
      )}
    </div>
  );
}

export default BoutiqueSearchBar;