import { useMemo, useState } from 'react';

export const SORT_OPTIONS = [
  { value: 'recent',   label: 'Recently Added' },
  { value: 'alpha',    label: 'A → Z' },
  { value: 'rating',   label: 'Highest Rated' },
  { value: 'progress', label: 'Progress' },
];

const DEFAULT_FILTERS = {
  search:    '',
  status:    '',
  genre:     '',
  minRating: 0,
  likedOnly: false,
  sortBy:    'recent',
};

export function useBookFilters(books) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  function set(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function reset() {
    setFilters(DEFAULT_FILTERS);
  }

  const allGenres = useMemo(() => {
    const set = new Set();
    books.forEach(b => b.genre?.forEach(g => set.add(g)));
    return [...set].sort();
  }, [books]);

  const filtered = useMemo(() => {
    let result = [...books];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.tags?.some(t => t.toLowerCase().includes(q)) ||
        b.notes?.toLowerCase().includes(q) ||
        b.chapters?.some(ch =>
          ch.notes?.toLowerCase().includes(q) ||
          ch.questions?.toLowerCase().includes(q) ||
          ch.quotes?.some(quote => quote.toLowerCase().includes(q))
        )
      );
    }

    if (filters.status) {
      result = result.filter(b => b.status === filters.status);
    }

    if (filters.genre) {
      result = result.filter(b => b.genre?.includes(filters.genre));
    }

    if (filters.minRating > 0) {
      result = result.filter(b => (b.rating ?? 0) >= filters.minRating);
    }

    if (filters.likedOnly) {
      result = result.filter(b => b.liked);
    }

    switch (filters.sortBy) {
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'progress': {
        const pct = b => b.totalChapters
          ? (b.chapters?.filter(c => c.isRead).length ?? 0) / b.totalChapters
          : 0;
        result.sort((a, b) => pct(b) - pct(a));
        break;
      }
      default: // recent
        result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    return result;
  }, [books, filters]);

  const isFiltered = filters.search || filters.status || filters.genre ||
    filters.minRating > 0 || filters.likedOnly || filters.sortBy !== 'recent';

  return { filters, set, reset, filtered, allGenres, isFiltered };
}
