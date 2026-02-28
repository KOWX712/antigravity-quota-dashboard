import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.sqlite');

const db = new Database(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER
  )
`);

export interface Account {
  id?: number;
  email: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export function upsertAccount(account: Account) {
  const stmt = db.prepare(`
    INSERT INTO accounts (email, access_token, refresh_token, expires_at)
    VALUES (@email, @access_token, @refresh_token, @expires_at)
    ON CONFLICT(email) DO UPDATE SET
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      expires_at = excluded.expires_at
  `);
  return stmt.run(account);
}

export function getAccount(email: string): Account | undefined {
  const stmt = db.prepare('SELECT * FROM accounts WHERE email = ?');
  return stmt.get(email) as Account | undefined;
}

export function getAllAccounts(): Account[] {
  const stmt = db.prepare('SELECT * FROM accounts');
  return stmt.all() as Account[];
}

export function deleteAccount(email: string) {
  const stmt = db.prepare('DELETE FROM accounts WHERE email = ?');
  return stmt.run(email);
}

export default db;
