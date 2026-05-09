const { Router } = require('express');
const store = require('../store');
const { requirePermission } = require('../auth');

const router = Router();

/**
 * @openapi
 * /books:
 *   get:
 *     summary: List all books (paginated)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Max number of books to return (max 100)
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *         description: Number of books to skip
 *     responses:
 *       200:
 *         description: Paginated list of books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *           example:
 *             title: "1984"
 *             author: "George Orwell"
 *             status: "not-started"
 *     responses:
 *       201:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: title and author are required
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Insufficient permissions
 */

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

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Book object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *   put:
 *     summary: Update a book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *   delete:
 *     summary: Delete a book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Book not found
 */

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
