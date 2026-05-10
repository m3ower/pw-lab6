import { apiFetch } from './client';

// ── Books ────────────────────────────────────────────────────
export async function fetchBooks(limit = 200, offset = 0) {
  const res = await apiFetch(`/books?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch books');
  const { data } = await res.json();
  return data;
}

export async function createBook(data) {
  const res = await apiFetch('/books', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create book');
  return res.json();
}

export async function updateBook(id, changes) {
  const res = await apiFetch(`/books/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
  if (!res.ok) throw new Error('Failed to update book');
  return res.json();
}

export async function deleteBook(id) {
  const res = await apiFetch(`/books/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete book');
}

// ── Chapters ─────────────────────────────────────────────────
export async function createChapter(bookId, data) {
  const res = await apiFetch(`/books/${bookId}/chapters`, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create chapter');
  return res.json();
}

export async function updateChapter(bookId, chapterId, changes) {
  const res = await apiFetch(`/books/${bookId}/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(changes) });
  if (!res.ok) throw new Error('Failed to update chapter');
  return res.json();
}

export async function deleteChapter(bookId, chapterId) {
  const res = await apiFetch(`/books/${bookId}/chapters/${chapterId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete chapter');
}
