import { useMemo } from 'react';

export function useStats(books) {
  return useMemo(() => {
    const completed   = books.filter(b => b.status === 'completed');
    const inProgress  = books.filter(b => b.status === 'in-progress');
    const notStarted  = books.filter(b => b.status === 'not-started');

    // Average rating (only rated books)
    const rated = completed.filter(b => b.rating > 0);
    const avgRating = rated.length
      ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1)
      : null;

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: rated.filter(b => b.rating === star).length,
    }));

    // Genre distribution
    const genreMap = {};
    books.forEach(b => b.genre?.forEach(g => {
      genreMap[g] = (genreMap[g] ?? 0) + 1;
    }));
    const genres = Object.entries(genreMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Monthly activity — completed books by month this year
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => {
      const label = new Date(currentYear, i).toLocaleString('en-US', { month: 'short' });
      const count = completed.filter(b => {
        const d = b.dateFinished ? new Date(b.dateFinished) : new Date(b.dateAdded);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      }).length;
      return { label, count };
    });

    // Top authors
    const authorMap = {};
    books.forEach(b => {
      if (b.author) authorMap[b.author] = (authorMap[b.author] ?? 0) + 1;
    });
    const topAuthors = Object.entries(authorMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Total chapters read
    const totalChaptersRead = books.reduce((sum, b) => {
      if (b.status === 'completed') return sum + (b.totalChapters ?? 0);
      return sum + (b.chaptersRead ?? 0);
    }, 0);

    // Liked books
    const likedCount = books.filter(b => b.liked).length;

    // Books completed this year
    const completedThisYear = completed.filter(b => {
      const d = b.dateFinished ? new Date(b.dateFinished) : null;
      return d && d.getFullYear() === currentYear;
    }).length;

    return {
      total: books.length,
      completed: completed.length,
      inProgress: inProgress.length,
      notStarted: notStarted.length,
      avgRating,
      ratingDist,
      genres,
      months,
      topAuthors,
      totalChaptersRead,
      likedCount,
      completedThisYear,
    };
  }, [books]);
}
