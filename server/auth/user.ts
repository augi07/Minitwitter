import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Database } from '../database/index';

const secretKey = process.env.TOKEN_SECRET || 'default_secret_key';

type UserRole = 'Admin' | 'anchorman' | 'user';

export class User {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const db = new Database();
      const query = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
      await db.executeSQL(query, [username, hashedPassword, 'user']);

      res.redirect('/login');
    } catch (err) {
      res.status(500).json({ message: 'Registration failed', error: err });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('Login Endpoint hit');
      const { username, password } = req.body as { username: string; password: string };
  
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }
  
      const db = new Database();
      const query = `SELECT * FROM users WHERE username = ?`;
      const users = await db.executeSQL(query, [username]);
  
      if (users.length === 0) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
      }
  
      const user = users[0];
      const hashedPassword = user.Password || user.password;
  
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
      }
  
      // JWT erzeugen
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: '2h' });
  
      console.log('JWT token generated successfully');
  
      res.redirect(`http://localhost:4200`);
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Login failed', error: err });
    }
  }
  
}