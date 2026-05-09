const { Router } = require('express');
const store = require('../store');
const { requirePermission } = require('../auth');

const router = Router();

// GET /books?limit=20&offset=0
router.get('/', requirePermission('READ'), (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit  ?? 20), 100);
  const offset = parseInt(req.query.offset ?? 0);
  const all    = store.getBooks();
  res.json({
    total:  all.length,
    limit,
    offset,
    data:   all.slice(offset, offset + limit),
  });
});

// GET /books/:id
router.get('/:id', requirePermission('READ'), (req, res) => {
  const book = store.getBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// POST /books
router.post('/', requirePermission('WRITE'), (req, res) => {
  const { title, author } = req.body ?? {};
  if (!title || !author)
    return res.status(400).json({ error: 'title and author are required' });
  res.status(201).json(store.createBook(req.body));
});

// PUT /books/:id
router.put('/:id', requirePermission('WRITE'), (req, res) => {
  const updated = store.updateBook(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Book not found' });
  res.json(updated);
});

// DELETE /books/:id
router.delete('/:id', requirePermission('DELETE'), (req, res) => {
  const deleted = store.deleteBook(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Book not found' });
  res.status(204).send();
});

module.exports = router;
