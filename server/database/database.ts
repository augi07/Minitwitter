import mariadb from 'mariadb'
import { Pool } from 'mariadb'
import { USER_TABLE, TWEET_TABLE } from './schema'

export class Database {
  // Properties
  private _pool: Pool;

  // Constructor
  constructor() {
    this._pool = mariadb.createPool({
      database: process.env.DB_NAME || 'minitwitter',
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'minitwitter',
      password: process.env.DB_PASSWORD || 'supersecret123',
      connectionLimit: 5,
    });
    this.initializeDBSchema();
  }

  // Methods
  private async initializeDBSchema(): Promise<void> {
    console.log('Initialisiere DB-Schema...');
    await this.executeSQL(USER_TABLE);
    await this.executeSQL(TWEET_TABLE);
  }

  public async executeSQL<T = any>(query: string, params: any[] = []): Promise<T[]> {
    let conn;
    try {
      conn = await this._pool.getConnection();
      console.log('Datenbankverbindung hergestellt');
      const res = await conn.query(query, params);
      return res as T[];
    } catch (err) {
      console.error('Datenbankabfragefehler:', err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }
}