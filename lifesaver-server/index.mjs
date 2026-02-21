import cors from 'cors';
import express from 'express';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

import createReportsRouter from './routes/reports.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, 'uploads');

await mkdir(uploadsDir, { recursive: true });

const upload = multer({ dest: uploadsDir });
const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173'
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 2 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS).unref?.();

function rateLimitMiddleware(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const lastRequest = rateLimitMap.get(key) ?? 0;

  if (now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequest)) / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'rate_limited', retryAfterSeconds: retryAfter });
    return;
  }

  rateLimitMap.set(key, now);
  next();
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use(
  '/reports',
  createReportsRouter({
    upload,
    rateLimitMiddleware
  })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);

app.listen(PORT, () => {
  console.log(`LifeSaver API listening on port ${PORT}`);
});
