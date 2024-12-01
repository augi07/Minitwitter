import { Request, Response, Express, NextFunction } from 'express';
import { User } from '../auth/user';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const secretKey = process.env.TOKEN_SECRET || 'default_secret_key';

export class API {
  // Properties
  app: Express;

  // Constructor
  constructor(app: Express) {
    this.app = app;

    // API-Endpunkte
    this.app.get('/hello', this.sayHello.bind(this));
    this.app.post('/register', User.register);
    this.app.post('/login', User.login);

    // Statische Routen für Login und Registrierung
    this.app.get('/login', (req: Request, res: Response) => {
      const filePath = path.resolve(__dirname, '../../client/login.html');
      console.log('Serving login.html from:', filePath);
      res.sendFile(filePath);
    });

    this.app.get('/register', (req: Request, res: Response) => {
      const filePath = path.resolve(__dirname, '../../client/register.html');
      console.log('Serving register.html from:', filePath);
      res.sendFile(filePath);
    });

    // Geschützte Route Beispiel
    this.app.get('/dashboard', this.authenticateToken.bind(this), this.showDashboard.bind(this));
  }

  // Methods
  private sayHello(req: Request, res: Response): void {
    res.send('Hello There!');
  }

  private showDashboard(req: Request, res: Response): void {
    res.send(`Willkommen im Dashboard, ${req.user?.username}!`);
  }

  private authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Zugriff verweigert.');
      return;
    }

    jwt.verify(token, secretKey, (err: any, user: any) => {
      if (err) {
        res.status(403).send('Token ist nicht gültig.');
        return;
      }
      req.user = user;
      next();
    });
  }
}