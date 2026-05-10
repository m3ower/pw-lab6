import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'my-shelf-secret-2024';

// In-memory stores
let books = [];

// Role → permissions
const ROLE_PERMISSIONS = {
  VISITOR: ['READ'],
  WRITER:  ['READ', 'WRITE'],
  ADMIN:   ['READ', 'WRITE', 'DELETE'],
};

app.use(cors());
app.use(express.json());

// ── Swagger ──────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Shelf API',
      version: '1.0.0',
      description:
        'Book library REST API with JWT role-based authentication.\n\n' +
        '**Roles & permissions:**\n' +
        '- `VISITOR` → `READ` (browse only)\n' +
        '- `WRITER`  → `READ + WRITE` (add & edit)\n' +
        '- `ADMIN`   → `READ + WRITE + DELETE` (full access)\n\n' +
        'Call `POST /token` or `GET /token?role=...` first, then click **Authorize** and paste the token.',
    },
    servers: [{ url: 'http://localhost:3001' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid', readOnly: true },
            title:         { type: 'string', example: 'The Great Gatsby' },
            author:        { type: 'string', example: 'F. Scott Fitzgerald' },
            status:        { type: 'string', enum: ['not-started', 'in-progress', 'completed'] },
            rating:        { type: 'number', minimum: 0, maximum: 5 },
            liked:         { type: 'boolean', default: false },
            genre:         { type: 'array', items: { type: 'string' } },
            tags:          { type: 'array', items: { type: 'string' } },
            totalChapters: { type: 'integer' },
            chaptersRead:  { type: 'integer' },
            notes:         { type: 'string' },
            coverImage:    { type: 'string' },
            link:          { type: 'string' },
            dateAdded:     { type: 'string', format: 'date-time', readOnly: true },
            chapters:      { type: 'array', items: { $ref: '#/components/schemas/Chapter' } },
          },
        },
        Chapter: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid', readOnly: true },
            title:    { type: 'string' },
            isRead:   { type: 'boolean', default: false },
            notes:    { type: 'string' },
            quotes:   { type: 'array', items: { type: 'string' } },
            dateAdded:{ type: 'string', format: 'date-time', readOnly: true },
          },
        },
        TokenRequest: {
          type: 'object',
          required: ['role'],
          properties: {
            role: { type: 'string', enum: ['VISITOR', 'WRITER', 'ADMIN'], example: 'ADMIN' },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            token:       { type: 'string' },
            role:        { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' }, example: ['READ', 'WRITE', 'DELETE'] },
            expiresIn:   { type: 'integer', example: 60 },
          },
        },
        PaginatedBooks: {
          type: 'object',
          properties: {
            data:   { type: 'array', items: { $ref: '#/components/schemas/Book' } },
            total:  { type: 'integer' },
            limit:  { type: 'integer' },
            offset: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  },
  apis: ['./index.js'],
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// ── Auth middleware ──────────────────────────────────────────
function requirePermission(permission) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET);
      if (!payload.permissions.includes(permission)) {
        return res.status(403).json({
          error: `Forbidden: role "${payload.role}" does not have ${permission} permission`,
        });
      }
      req.user = payload;
      next();
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' ? 'Token expired — request a new one' : 'Invalid token';
      res.status(401).json({ error: msg });
    }
  };
}

// ── Token endpoints ──────────────────────────────────────────

/**
 * @openapi
 * /token:
 *   post:
 *     summary: Get a JWT by sending role in JSON body
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: JWT issued (expires in 1 minute)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid role
 */
app.post('/token', (req, res) => {
  const { role } = req.body;
  if (!ROLE_PERMISSIONS[role]) {
    return res.status(400).json({ error: 'Invalid role. Use VISITOR, WRITER or ADMIN' });
  }
  const permissions = ROLE_PERMISSIONS[role];
  const token = jwt.sign({ role, permissions }, JWT_SECRET, { expiresIn: '1m' });
  res.json({ token, role, permissions, expiresIn: 60 });
});

/**
 * @openapi
 * /token:
 *   get:
 *     summary: Get a JWT by passing role as a query parameter
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [VISITOR, WRITER, ADMIN]
 *     responses:
 *       200:
 *         description: JWT issued (expires in 1 minute)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid role
 */
app.get('/token', (req, res) => {
  const { role } = req.query;
  if (!ROLE_PERMISSIONS[role]) {
    return res.status(400).json({ error: 'Invalid role. Use VISITOR, WRITER or ADMIN' });
  }
  const permissions = ROLE_PERMISSIONS[role];
  const token = jwt.sign({ role, permissions }, JWT_SECRET, { expiresIn: '1m' });
  res.json({ token, role, permissions, expiresIn: 60 });
});

// ── Books ────────────────────────────────────────────────────

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Get books (paginated)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *         description: Max books to return
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *         description: Number of books to skip
 *     responses:
 *       200:
 *         description: Paginated list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedBooks'
 *       401:
 *         description: Missing or expired token
 *       403:
 *         description: Insufficient permissions
 */
app.get('/books', requirePermission('READ'), (req, res) => {
  const limit  = Math.min(Math.max(parseInt(req.query.limit)  || 10, 1), 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  res.json({ data: books.slice(offset, offset + limit), total: books.length, limit, offset });
});

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get a single book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Not found
 */
app.get('/books/:id', requirePermission('READ'), (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

/**
 * @openapi
 * /books:
 *   post:
 *     summary: Add a book (requires WRITE)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       403:
 *         description: Requires WRITE
 */
app.post('/books', requirePermission('WRITE'), (req, res) => {
  const book = {
    id:        randomUUID(),
    dateAdded: new Date().toISOString(),
    liked:     false,
    chapters:  [],
    sessions:  [],
    ...req.body,
  };
  books.unshift(book);
  res.status(201).json(book);
});

/**
 * @openapi
 * /books/{id}:
 *   put:
 *     summary: Update a book (requires WRITE)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
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
 *       403:
 *         description: Requires WRITE
 *       404:
 *         description: Not found
 */
app.put('/books/:id', requirePermission('WRITE'), (req, res) => {
  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  books[idx] = { ...books[idx], ...req.body, id: books[idx].id, dateAdded: books[idx].dateAdded };
  res.json(books[idx]);
});

/**
 * @openapi
 * /books/{id}:
 *   delete:
 *     summary: Delete a book (requires DELETE — ADMIN only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       403:
 *         description: Requires DELETE (ADMIN only)
 *       404:
 *         description: Not found
 */
app.delete('/books/:id', requirePermission('DELETE'), (req, res) => {
  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  books.splice(idx, 1);
  res.status(204).send();
});

// ── Chapters ─────────────────────────────────────────────────

/**
 * @openapi
 * /books/{bookId}/chapters:
 *   post:
 *     summary: Add a chapter to a book (requires WRITE)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       201:
 *         description: Chapter created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chapter'
 *       403:
 *         description: Requires WRITE
 *       404:
 *         description: Book not found
 */
app.post('/books/:bookId/chapters', requirePermission('WRITE'), (req, res) => {
  const book = books.find(b => b.id === req.params.bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const chapter = {
    id:        randomUUID(),
    dateAdded: new Date().toISOString(),
    isRead:    false,
    quotes:    [],
    ...req.body,
  };
  book.chapters = [...(book.chapters ?? []), chapter];
  res.status(201).json(chapter);
});

/**
 * @openapi
 * /books/{bookId}/chapters/{chapterId}:
 *   put:
 *     summary: Update a chapter (requires WRITE)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chapter'
 *     responses:
 *       200:
 *         description: Updated chapter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chapter'
 *       404:
 *         description: Book or chapter not found
 */
app.put('/books/:bookId/chapters/:chapterId', requirePermission('WRITE'), (req, res) => {
  const book = books.find(b => b.id === req.params.bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const idx = (book.chapters ?? []).findIndex(c => c.id === req.params.chapterId);
  if (idx === -1) return res.status(404).json({ error: 'Chapter not found' });
  book.chapters[idx] = { ...book.chapters[idx], ...req.body, id: book.chapters[idx].id };
  res.json(book.chapters[idx]);
});

/**
 * @openapi
 * /books/{bookId}/chapters/{chapterId}:
 *   delete:
 *     summary: Delete a chapter (requires DELETE)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       403:
 *         description: Requires DELETE
 *       404:
 *         description: Not found
 */
app.delete('/books/:bookId/chapters/:chapterId', requirePermission('DELETE'), (req, res) => {
  const book = books.find(b => b.id === req.params.bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const before = (book.chapters ?? []).length;
  book.chapters = book.chapters.filter(c => c.id !== req.params.chapterId);
  if (book.chapters.length === before) return res.status(404).json({ error: 'Chapter not found' });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server:  http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
