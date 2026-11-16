import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useProjectStore, useScreens } from '@/hooks/useProjectStore';

export function CanvasSearch() {
  const searchOpen = useProjectStore((s) => s.ui.searchOpen);
  const searchQuery = useProjectStore((s) => s.ui.searchQuery);
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery);
  const closeSearch = useProjectStore((s) => s.closeSearch);
  const screens = useScreens();
  const { setCenter } = useReactFlow();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return screens.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.fileName.toLowerCase().includes(q)
    );
  }, [screens, searchQuery]);

  const navigateToMatch = useCallback(
    (index: number) => {
      const match = matches[index];
      if (!match) return;
      setCenter(match.position.x + 120, match.position.y + 75, {
        zoom: 1,
        duration: 300,
      });
      useProjectStore.getState().selectNode(match.id);
    },
    [matches, setCenter]
  );

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // When the query changes, reset to the first match and center it so the
  // "X of N" badge always reflects the node the canvas is actually showing.
  useEffect(() => {
    setActiveIndex(0);
    if (matches.length > 0) navigateToMatch(0);
  }, [matches, navigateToMatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
        return;
      }
      if (matches.length === 0) return;
      // Advance/retreat and center the SAME index the badge shows — no desync.
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (activeIndex + 1) % matches.length;
        setActiveIndex(next);
        navigateToMatch(next);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (activeIndex - 1 + matches.length) % matches.length;
        setActiveIndex(prev);
        navigateToMatch(prev);
      }
    },
    [closeSearch, matches.length, activeIndex, navigateToMatch]
  );

  if (!searchOpen) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background border border-border rounded-lg shadow-lg px-3 py-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search screens..."
        className="bg-transparent border-none outline-none text-sm w-48"
      />
      {searchQuery.trim() && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {matches.length > 0
            ? `${activeIndex + 1} of ${matches.length}`
            : 'No matches'}
        </span>
      )}
      <button
        onClick={closeSearch}
        className="ml-1 w-5 h-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
