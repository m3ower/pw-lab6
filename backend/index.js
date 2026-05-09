const express = require('express');
const cors    = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const { createToken, ROLE_PERMISSIONS } = require('./src/auth');
const booksRouter    = require('./src/routes/books');
const chaptersRouter = require('./src/routes/chapters');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Swagger ──────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Shelf API',
      version: '1.0.0',
      description: 'CRUD API for the My Shelf book tracker',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            id:            { type: 'string', example: 'uuid' },
            title:         { type: 'string', example: 'Dune' },
            author:        { type: 'string', example: 'Frank Herbert' },
            status:        { type: 'string', enum: ['not-started', 'reading', 'completed'] },
            rating:        { type: 'integer', minimum: 0, maximum: 5 },
            liked:         { type: 'boolean' },
            totalChapters: { type: 'integer' },
            chaptersRead:  { type: 'integer' },
            dateAdded:     { type: 'string', format: 'date-time' },
          },
        },
        Chapter: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            title:     { type: 'string', example: 'Chapter 1' },
            notes:     { type: 'string' },
            isRead:    { type: 'boolean' },
            dateAdded: { type: 'string', format: 'date-time' },
          },
        },
        Paginated: {
          type: 'object',
          properties: {
            total:  { type: 'integer' },
            limit:  { type: 'integer' },
            offset: { type: 'integer' },
            data:   { type: 'array', items: {} },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./index.js', './src/routes/*.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

// ── Health ───────────────────────────────────────────────────
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Token ────────────────────────────────────────────────────
/**
 * @openapi
 * /token:
 *   get:
 *     summary: Get a JWT (expires in 1 minute)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, WRITER, VISITOR]
 *         description: Role (ADMIN=READ+WRITE+DELETE, WRITER=READ+WRITE, VISITOR=READ)
 *       - in: query
 *         name: permissions
 *         schema:
 *           type: string
 *         description: Comma-separated permissions e.g. READ,WRITE
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Missing role or permissions
 *   post:
 *     summary: Get a JWT via POST body (expires in 1 minute)
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, WRITER, VISITOR]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: JWT token
 *       400:
 *         description: Missing role or permissions
 */
app.get('/token', (req, res) => {
  const { role, permissions } = req.query;
  if (!role && !permissions)
    return res.status(400).json({ error: 'Provide role or permissions' });

  const payload = role
    ? { role }
    : { permissions: permissions.split(',') };
  res.json({ token: createToken(payload) });
});

app.post('/token', (req, res) => {
  const { role, permissions } = req.body ?? {};
  if (!role && !Array.isArray(permissions))
    return res.status(400).json({ error: 'Provide role or permissions in body' });

  const payload = role ? { role } : { permissions };
  res.json({ token: createToken(payload), availableRoles: Object.keys(ROLE_PERMISSIONS) });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/books', booksRouter);
app.use('/books/:bookId/chapters', chaptersRouter);

app.listen(PORT, () => {
  console.log(`My Shelf API  → http://localhost:${PORT}`);
  console.log(`Swagger docs  → http://localhost:${PORT}/docs`);
});
