/// <reference path="./types/express.d.ts" />
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import locationRoutes from './routes/location.routes';
import assetRoutes from './routes/assets';
import { errorHandler } from './middleware/error.middleware';
import { env } from './config/env';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images/assets
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});


// Serve uploads as statically hosted media
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/assets', assetRoutes);

app.use(errorHandler);

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

