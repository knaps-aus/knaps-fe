import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 5173;
const staticDir = path.join(__dirname, '..', 'dist', 'public');

app.use(express.static(staticDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend running on http://localhost:${port}`);
});
