import { CapacitorSQLite } from '@capacitor-community/sqlite';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';

let db: SQLiteDBConnection | undefined;

export async function initDB() {
  if (db) return db; // Already initialized

  const sqlite = CapacitorSQLite;

  const connection: any = await sqlite.createConnection({ // Returns type as any
    database: 'trades_db',
    version: 1,
    encrypted: false,
    mode: 'no-encryption'
  });

  db = connection as SQLiteDBConnection;

  await db!.open();

  await db!.execute(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      quantity REAL NOT NULL,
      buyPrice REAL NOT NULL,
      buyDate TEXT NOT NULL,
      sellPrice REAL,
      sellDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  return db;
}
