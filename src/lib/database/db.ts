import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';


const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | undefined;



export async function initDB() {
  if (db) return db;

  if (!Capacitor.isNativePlatform()) throw new Error("SQLite only supported on native");

  // Check if a connection already exists
  const isConn = await sqlite.isConnection("trades_db", false);
  if (isConn.result) {
    // Retrieve existing connection
    db = await sqlite.retrieveConnection("trades_db", false);
    // Make sure the connection is open
    await db.open();
  } else {
    // Create a new connection
    db = await sqlite.createConnection("trades_db", false, "no-encryption", 1, false);
    await db.open();
    // Create table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        buyDate DATE NOT NULL,
        quantity REAL NOT NULL,
        buyPrice REAL NOT NULL,
        note TEXT,
        createdAt TEXT NOT NULL,
        sellDate DATE,
        sellPrice REAL,
        updatedAt TEXT
      );
    `);
  }

  return db;
}

export async function getDB() {
  if (!db) {
    await initDB();
  }

  const result = await db!.query(`SELECT * FROM trades;`);

  return result.values || [];
}

export async function addTestTrade() {
  if (!db) {
    await initDB();
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db!.run(`
    INSERT INTO trades (id, symbol, quantity, buyPrice, buyDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `, [id, 'Cloudflare', 10, 150.00, now, now, now]);
}

export async function enterNewBuyStockToDB(symbol: string, buyDate: Date, quantity: number, buyPrice: number,  createdAt: Date, note?: string, updatedAt?: string) {
  const id = crypto.randomUUID(); // Check if it creates real unique IDs
  const now = new Date().toISOString();

  try {

    await db!.run(`
      INSERT INTO trades (id, symbol, quantity, buyPrice, buyDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?);
      `, [id, symbol, quantity, buyPrice, buyDate.toISOString(), createdAt.toISOString(), updatedAt ? updatedAt : now]);
      } catch (error) {
        console.error("Error inserting new stock trade: ", error);
      }
}

export async function enterNewSellStockToDB(symbol: string, sellDate: Date, quantity: number, sellPrice: number,  createdAt: Date, note?: string, updatedAt?: string) {
try {
  await db!.run(`
    UPDATE trades
    SET sellDate = ?, sellPrice = ?, updatedAt = ?
    WHERE symbol = ? AND quantity = ? AND sellDate IS NULL;
    `, [sellDate.toISOString(), sellPrice, createdAt.toISOString(), symbol, quantity]);
}
catch (error) {
  console.error("Error inserting new stock trade: ", error);
}
}

