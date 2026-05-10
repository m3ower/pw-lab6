const { Router } = require('express');
const store = require('../store');
const { requirePermission } = require('../auth');

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /books/{bookId}/chapters:
 *   get:
 *     summary: List chapters for a book (paginated)
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Paginated list of chapters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 *       404:
 *         description: Book not found
 *   post:
 *     summary: Add a chapter to a book
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chapter'
 *           example:
 *             title: "Chapter 1"
 *             notes: "Really gripping opening"
 *     responses:
 *       201:
 *         description: Chapter created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chapter'
 *       400:
 *         description: title is required
 *       404:
 *         description: Book not found
 */

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

/**
 * @openapi
 * /books/{bookId}/chapters/{id}:
 *   get:
 *     summary: Get a single chapter
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chapter object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chapter'
 *       404:
 *         description: Chapter not found
 *   put:
 *     summary: Update a chapter
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chapter'
 *     responses:
 *       200:
 *         description: Updated chapter
 *       404:
 *         description: Chapter not found
 *   delete:
 *     summary: Delete a chapter
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Chapter not found
 */

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
