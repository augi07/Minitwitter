import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Database } from '../database';
import { UserModel } from '../models/userModels';
import { validationResult } from 'express-validator';

const secretKey = process.env.TOKEN_SECRET || 'default_secret_key';

export class User {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      // Überprüfung der Validierungsergebnisse
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        res.status(400).send(`<p>${errorMessages}</p><a href="/register">Zurück zur Registrierung</a>`);
        return;
      }

      // Debugging: Logge den gesamten Request Body
      console.log('Request Body:', req.body);

      const { name, username, password } = req.body as { name: string; username: string; password: string };

      const hashedPassword = await bcrypt.hash(password, 10);
      const db = new Database();
      const query = `INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)`;

      await db.executeSQL(query, [name, username, hashedPassword, 'user']);

      // Erfolgreiche Registrierung, Weiterleitung zum Login
      res.redirect('/login');
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Benutzername bereits vergeben
        res.status(409).send(`<p>Username bereits vergeben.</p><a href="/register">Zurück zur Registrierung</a>`);
      } else {
        console.error('Registrierungsfehler:', err);
        // Allgemeiner Fehler, Weiterleitung mit Fehlermeldung
        res.status(500).send(`<p>Registrierung fehlgeschlagen. Bitte versuche es später erneut.</p><a href="/register">Zurück zur Registrierung</a>`);
      }
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      // Überprüfung der Validierungsergebnisse
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        res.status(400).send(`<p>${errorMessages}</p><a href="/login">Zurück zum Login</a>`);
        return;
      }

      const { username, password } = req.body as { username: string; password: string };

      const db = new Database();
      const query = `SELECT * FROM users WHERE username = ?`;
      const users = await db.executeSQL<UserModel>(query, [username]);

      if (users.length === 0) {
        // Benutzername nicht gefunden
        res.status(401).send(`<p>Ungültiger Username oder Passwort.</p><a href="/login">Zurück zum Login</a>`);
        return;
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Passwort stimmt nicht überein
        res.status(401).send(`<p>Ungültiger Username oder Passwort.</p><a href="/login">Zurück zum Login</a>`);
        return;
      }

      // JWT erzeugen
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        secretKey,
        { expiresIn: '2h' }
      );

      // Token im HttpOnly-Cookie setzen
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Temporär auf false setzen für Entwicklung
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000 // 2 Stunden
      });

      // Erfolgreicher Login, Weiterleitung zur geschützten Seite
      res.redirect('/dashboard');
    } catch (err: any) {
      console.error('Fehler beim Login:', err);
      // Allgemeiner Fehler, Weiterleitung mit Fehlermeldung
      res.status(500).send(`<p>Login fehlgeschlagen. Bitte versuche es später erneut.</p><a href="/login">Zurück zum Login</a>`);
    }
  }
}