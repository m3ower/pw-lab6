const { Router } = require('express');
const store = require('../store');
const { requirePermission } = require('../auth');

const router = Router({ mergeParams: true });

// GET /books/:bookId/chapters?limit=50&offset=0
router.get('/', requirePermission('READ'), (req, res) => {
  const chapters = store.getChapters(req.params.bookId);
  if (!chapters) return res.status(404).json({ error: 'Book not found' });
  const limit  = Math.min(parseInt(req.query.limit  ?? 50), 200);
  const offset = parseInt(req.query.offset ?? 0);
  res.json({
    total:  chapters.length,
    limit,
    offset,
    data:   chapters.slice(offset, offset + limit),
  });
});

// GET /books/:bookId/chapters/:id
router.get('/:id', requirePermission('READ'), (req, res) => {
  const chapter = store.getChapter(req.params.bookId, req.params.id);
  if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
  res.json(chapter);
});

// POST /books/:bookId/chapters
router.post('/', requirePermission('WRITE'), (req, res) => {
  const { title } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const chapter = store.createChapter(req.params.bookId, req.body);
  if (!chapter) return res.status(404).json({ error: 'Book not found' });
  res.status(201).json(chapter);
});

// PUT /books/:bookId/chapters/:id
router.put('/:id', requirePermission('WRITE'), (req, res) => {
  const updated = store.updateChapter(req.params.bookId, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Chapter not found' });
  res.json(updated);
});

// DELETE /books/:bookId/chapters/:id
router.delete('/:id', requirePermission('DELETE'), (req, res) => {
  const deleted = store.deleteChapter(req.params.bookId, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Chapter not found' });
  res.status(204).send();
});

module.exports = router;
