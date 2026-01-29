import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';


const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | undefined;



export async function initDB() {
  try {
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
        CREATE TABLE IF NOT EXISTS buys (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        buyDate DATE NOT NULL,
        quantity REAL NOT NULL,
        buyPrice REAL NOT NULL,
        note TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS sells (
        id TEXT PRIMARY KEY,
        buyId TEXT NOT NULL,
        sellDate DATE NOT NULL,
        quantity REAL NOT NULL,
        sellPrice REAL NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT,
        FOREIGN KEY (buyId) REFERENCES buys(id)
        );
      `);
    }

    return db;
  }
  catch (error) {
    console.error("Error initializing database: ", error);
    throw new Error("Failed to initialize database. Restart the app");
  }
}

export async function getDB() {
  if (!db) {
    await initDB();
  }
  return db!;
}

export async function getDBAllBuys() {
  const database = await getDB();

  const result = await db!.query(`SELECT * FROM buys ORDER BY buyDate DESC;`);
  return result.values ?? [];
}

export async function addTestTrade() {
  const database = await getDB();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db!.run(`
    INSERT INTO buys (id, symbol, buyDate, quantity, buyPrice, note, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `, [id, 'Cloudflare', now, 10, 150.00, "Test note", now, now]);
}

export async function enterNewBuyStockToDB(symbol: string, buyDate: Date, quantity: number, buyPrice: number, note?: string) {
  const id = crypto.randomUUID(); // TODO check if it actually creates a unique one and if so remove the variable and insert directly
  const now = new Date().toISOString();

  try {
    await db!.run(`
      INSERT INTO buys (id, symbol, buyDate, quantity, buyPrice, note, createdAt)
      VALUES ();
      `, [id, symbol, buyDate.toISOString, quantity, buyPrice, note ?? null, now]);

  } catch (error) {
    console.error(`Error inserting buy ${symbol}:`, error);
  }
}

export async function enterNewSellStockToDB() {
  const database = await getDB();

  // TODO: code functionality
}

export async function getAvailableSellEntries() {
  const database = await getDB();

  const result = await db!.query(`
    SELECT buys.id, buys.symbol,
      (buys.quantity - IFNULL((SELECT sum(quantity) FROM sells WHERE buyId = buys.id), 0)) AS availableQuantity
    FROM buys
      HAVING availableQuantity > 0
    ORDER BY buys.buyDate DESC;
  `);

  return result.values ?? [];
}

