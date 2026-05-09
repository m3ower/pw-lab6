const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () =>
  console.log(`My Shelf API running at http://localhost:${PORT}`)
);
