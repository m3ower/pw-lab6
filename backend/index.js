const express = require('express');
const cors = require('cors');

const { createToken, ROLE_PERMISSIONS } = require('./src/auth');
const booksRouter    = require('./src/routes/books');
const chaptersRouter = require('./src/routes/chapters');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/**
 * GET /token?role=ADMIN
 * GET /token?permissions=READ,WRITE
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

/**
 * POST /token
 * Body: { "role": "ADMIN" }  or  { "permissions": ["READ","WRITE"] }
 */
app.post('/token', (req, res) => {
  const { role, permissions } = req.body ?? {};
  if (!role && !Array.isArray(permissions))
    return res.status(400).json({ error: 'Provide role or permissions in body' });

  const payload = role ? { role } : { permissions };
  res.json({ token: createToken(payload), availableRoles: Object.keys(ROLE_PERMISSIONS) });
});

app.use('/books', booksRouter);
app.use('/books/:bookId/chapters', chaptersRouter);

app.listen(PORT, () =>
  console.log(`My Shelf API running at http://localhost:${PORT}`)
);
