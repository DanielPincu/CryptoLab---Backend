import http from 'http';
import express from 'express';
import cors from 'cors';
import routes from './router/routes';
import { connectDB } from './driver/mongo.driver';
import { attachFinnhubAndClientWS } from './websocket/finnhub.websocket';

import { env } from './config/env';
import cookieParser from 'cookie-parser';

function setupCors(app: express.Express) {
  const origins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}


export async function startServer() {
  try {
    await connectDB();

    const app = express();
    setupCors(app);
    app.use(express.json());
    app.use(cookieParser());

    // Mount all routes from routes.ts
    app.use('/', routes);

    const server = http.createServer(app);

    const PORT = env.PORT;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      // Attach Finnhub + client WebSocket server to the same HTTP server
      attachFinnhubAndClientWS(server);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}
