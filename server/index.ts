// server/index.ts

import express, { Express, Request, Response } from 'express';
import { API } from './api';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Database } from './database';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

// Simuliert `__dirname` in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Backend {
  public app: Express;
  private _api: API;
  private _database: Database;
  private _env: string;

  constructor() {
    this.app = express();
    this._database = new Database();

    // Sicherheits-Middleware anwenden
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "https://cdn.tailwindcss.com" // Erlaubt Tailwind CDN
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Ermöglicht Inline-Styles (für Tailwind erforderlich)
            "https://cdn.tailwindcss.com" // Erlaubt Tailwind CDN
          ],
          connectSrc: ["'self'"],
          imgSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        }
      }
    }));

    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
      methods: ['GET', 'POST'],
      credentials: true
    }));

    // Rate Limiting einrichten
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      max: 100, // max. 100 Anfragen pro IP pro Fenster
      message: 'Zu viele Anfragen von dieser IP, bitte versuche es später erneut.'
    });
    this.app.use(limiter);

    // Middleware zur Verarbeitung von JSON und URL-encoded Daten
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Cookie Parser Middleware
    this.app.use(cookieParser());

    // API-Endpunkte
    this._api = new API(this.app);
    this._env = process.env.NODE_ENV || 'development';

    this.setupStaticFiles();
    this.setupRoutes();
    this.startServer();
  }

  private setupStaticFiles(): void {
    // Statische Dateien aus dem `client`-Ordner bereitstellen
    this.app.use('/static', express.static(path.resolve(__dirname, '../client')));
  }

  private setupRoutes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      const indexPath = path.resolve(__dirname, '../client/index.html');
      res.sendFile(indexPath);
    });
  }

  private startServer(): void {
    const port = 4200;
    http.createServer(this.app).listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

const backend = new Backend();
export const viteNodeApp = backend.app;