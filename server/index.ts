import express, { Express, Request, Response } from 'express';
import { API } from './api';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Database } from './database';

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

    // Middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

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