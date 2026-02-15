import dotenvFlow from 'dotenv-flow';
import http from 'http';
import express from 'express';
import cors from 'cors';
import routes from './router/routes';
import { connectDB } from './driver/mongo.driver';
import { attachFinnhubAndClientWS } from './websocket/finnhub.websocket';

dotenvFlow.config();

export async function startServer() {
  try {
    await connectDB();

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Mount all routes from routes.ts
    app.use('/', routes);

    const server = http.createServer(app);

    // Attach Finnhub + client WebSocket server to the same HTTP server
    attachFinnhubAndClientWS(server);

    const PORT = Number(process.env.PORT ?? 3000);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

startServer();