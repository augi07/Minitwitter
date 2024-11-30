import mariadb from 'mariadb'
import { Pool } from 'mariadb'
import { USER_TABLE, TWEET_TABLE } from './schema'

export class Database {
  // Properties
  private _pool: Pool
  // Constructor
  constructor() {
    this._pool = mariadb.createPool({
      database: process.env.DB_NAME || 'minitwitter',
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'minitwitter',
      password: process.env.DB_PASSWORD || 'supersecret123',
      connectionLimit: 5,
    })
    this.initializeDBSchema()
  }
  // Methods
  private initializeDBSchema = async () => {
    console.log('Initializing DB schema...')
    await this.executeSQL(USER_TABLE)
    await this.executeSQL(TWEET_TABLE)
  }

  public async executeSQL(query: string, params: any[] = []): Promise<any> {
    try {
      const conn = await this._pool.getConnection();
      console.log('Database connection established'); // Log zur Bestätigung der Verbindung
      const res = await conn.query(query, params);
      conn.release();
      return res;
    } catch (err) {
      console.error('Database query error:', err); // SQL-Fehler loggen
      throw err;
    }
  }
}
