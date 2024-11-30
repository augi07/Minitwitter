import { Request, Response, Express } from 'express';
import { User } from '../auth/user';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Simuliert `__dirname` in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class API {
  // Properties
  app: Express;

  // Constructor
  constructor(app: Express) {
    this.app = app;

    // API-Endpunkte
    this.app.get('/hello', this.sayHello);
    this.app.post('/register', User.register);
    this.app.post('/login', User.login);

    // Statische Routen
    this.app.get('/login', (req: Request, res: Response) => {
      const filePath = path.resolve(__dirname, '../../client/login.html'); // Absoluter Pfad zur Datei
      console.log('Serving login.html from:', filePath); // Debugging
      res.sendFile(filePath);
    });

    this.app.get('/register', (req: Request, res: Response) => {
      const filePath = path.resolve(__dirname, '../../client/register.html'); // Absoluter Pfad zur Datei
      console.log('Serving register.html from:', filePath); // Debugging
      res.sendFile(filePath);
    });
  }

  // Methods
  private sayHello(req: Request, res: Response) {
    res.send('Hello There!');
  }
}