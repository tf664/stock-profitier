import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | undefined;

// ─── Init ───────────────────────────────────────────────────────────────────

export async function initDB(): Promise<SQLiteDBConnection> {
	if (db) return db;

	if (!Capacitor.isNativePlatform()) throw new Error('SQLite only supported on native');

	const isConn = await sqlite.isConnection('trades_db', false);
	if (isConn.result) {
		db = await sqlite.retrieveConnection('trades_db', false);
		await db.open();
	} else {
		db = await sqlite.createConnection('trades_db', false, 'no-encryption', 1, false);
		await db.open();
		await db.execute(`
  CREATE TABLE IF NOT EXISTS buys (
    id            TEXT PRIMARY KEY,
    symbol        TEXT NOT NULL,
    name          TEXT NOT NULL,
    assetClass    TEXT,
    buyDate       TEXT NOT NULL,
    quantity      REAL NOT NULL,
    buyPrice      REAL NOT NULL,
    fees          REAL NOT NULL DEFAULT 0,
    grossAmount   REAL NOT NULL DEFAULT 0,
    currency      TEXT NOT NULL DEFAULT 'EUR',
    exchange      TEXT,
    note          TEXT,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT
  );
`);

		await db.execute(`
  CREATE TABLE IF NOT EXISTS sells (
    id            TEXT PRIMARY KEY,
    symbol        TEXT NOT NULL,
    name          TEXT NOT NULL,
    assetClass    TEXT,
    sellDate      TEXT NOT NULL,
    quantity      REAL NOT NULL,
    sellPrice     REAL NOT NULL,
    fees          REAL NOT NULL DEFAULT 0,
    grossAmount   REAL NOT NULL DEFAULT 0,
    currency      TEXT NOT NULL DEFAULT 'EUR',
    exchange      TEXT,
    note          TEXT,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT
  );
`);

		await db.execute(`
  CREATE TABLE IF NOT EXISTS sell_lots (
    id        TEXT PRIMARY KEY,
    sellId    TEXT NOT NULL REFERENCES sells(id),
    buyId     TEXT NOT NULL REFERENCES buys(id),
    quantity  REAL NOT NULL
  );
`);
	}

	return db;
}

export async function getDB(): Promise<SQLiteDBConnection> {
	if (!db) await initDB();
	return db!;
}

// ─── Buys ────────────────────────────────────────────────────────────────────

export async function getAllBuys() {
	const db = await getDB();
	const result = await db.query(`SELECT * FROM buys ORDER BY buyDate DESC;`);
	return result.values ?? [];
}

export async function addBuy(
	symbol: string,
	buyDate: Date,
	quantity: number,
	buyPrice: number,
	fees: number = 0,
	currency: string = 'EUR',
	note?: string
) {
	const db = await getDB();
	const id = crypto.randomUUID();
	const now = new Date().toISOString();

	//addBuy("NVDA", "Nvidia Corp", "Stock", new Date(), 5, 180, 1.99, "NASDAQ")
	await db.run(
		`INSERT INTO buys (id, symbol, buyDate, quantity, buyPrice, fees, currency, note, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
		[id, symbol, buyDate.toISOString(), quantity, buyPrice, fees, currency, note ?? null, now]
	);

	return id;
}

export async function deleteBuy(id: string) {
	const db = await getDB();
	await db.run(`DELETE FROM buys WHERE id = ?;`, [id]);
}

// ─── Sells ───────────────────────────────────────────────────────────────────

export async function getAllSells() {
	const db = await getDB();
	const result = await db.query(`SELECT * FROM sells ORDER BY sellDate DESC;`);
	return result.values ?? [];
}

export async function addSell(
	symbol: string,
	sellDate: Date,
	quantity: number,
	sellPrice: number,
	fees: number = 0,
	currency: string = 'EUR',
	note?: string
) {
	const db = await getDB();
	const id = crypto.randomUUID();
	const now = new Date().toISOString();

	await db.run(
		`INSERT INTO sells (id, symbol, sellDate, quantity, sellPrice, fees, currency, note, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
		[id, symbol, sellDate.toISOString(), quantity, sellPrice, fees, currency, note ?? null, now]
	);

	return id;
}

export async function deleteSell(id: string) {
	const db = await getDB();
	await db.run(`DELETE FROM sells WHERE id = ?;`, [id]);
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Offene Positionen: wie viele Stück je Symbol noch gehalten werden */
export interface OpenPosition {
	symbol: string;
	openQuantity: number;
}

export async function getOpenPositions(): Promise<OpenPosition[]> {
	const db = await getDB();
	const result = await db.query(`
    SELECT
      symbol,
      SUM(CASE WHEN type = 'BUY'  THEN quantity ELSE 0 END) -
      SUM(CASE WHEN type = 'SELL' THEN quantity ELSE 0 END) AS openQuantity
    FROM (
      SELECT symbol, 'BUY'  AS type, quantity FROM buys
      UNION ALL
      SELECT symbol, 'SELL' AS type, quantity FROM sells
    )
    GROUP BY symbol
    HAVING openQuantity > 0;
  `);
	return (result.values ?? []) as OpenPosition[];
}

/** Realisierter Gewinn/Verlust pro Symbol */
export async function getRealizedPnL() {
	const db = await getDB();
	const result = await db.query(`
    SELECT
      s.symbol,
      ROUND(SUM(s.quantity * s.sellPrice) - SUM(s.fees), 2) AS sellVolume,
      ROUND(SUM(b.quantity * b.buyPrice)  + SUM(b.fees), 2) AS buyVolume,
      ROUND(
        (SUM(s.quantity * s.sellPrice) - SUM(s.fees)) -
        (SUM(b.quantity * b.buyPrice)  + SUM(b.fees)),
        2
      ) AS realizedPnL
    FROM sells s
    JOIN buys b ON b.symbol = s.symbol
    GROUP BY s.symbol;
  `);
	return result.values ?? [];
}

/** Alle Transaktionen eines Symbols chronologisch */
export async function getTransactionHistory(symbol: string) {
	const db = await getDB();
	const result = await db.query(
		`
    SELECT 'BUY'  AS type, buyDate  AS date, quantity, buyPrice  AS price, fees FROM buys  WHERE symbol = ?
    UNION ALL
    SELECT 'SELL' AS type, sellDate AS date, quantity, sellPrice AS price, fees FROM sells WHERE symbol = ?
    ORDER BY date;
  `,
		[symbol, symbol]
	);
	return result.values ?? [];
}

export interface PortfolioBySymbol {
	symbol: string;
	totalInvested: number; // quantity * buyPrice + fees
	totalValue: number; // wird später mit aktuellem Kurs berechnet
}

/** Investiertes Kapital pro Symbol (für Pie/Bar Chart) */
export async function getInvestedPerSymbol(): Promise<PortfolioBySymbol[]> {
	const db = await getDB();
	const result = await db.query(`
    SELECT
      symbol,
      ROUND(SUM(quantity * buyPrice) + SUM(fees), 2) AS totalInvested
    FROM buys
    GROUP BY symbol
    ORDER BY totalInvested DESC;
  `);
	return (result.values ?? []) as PortfolioBySymbol[];
}

export interface MonthlyTransaction {
	month: string; // z.B. "2024-03"
	bought: number;
	sold: number;
}

/** Kauf- und Verkaufsvolumen pro Monat (für Bar/Line Chart) */
export async function getMonthlyVolume(): Promise<MonthlyTransaction[]> {
	const db = await getDB();
	const result = await db.query(`
    SELECT
      strftime('%Y-%m', date) AS month,
      SUM(CASE WHEN type = 'BUY'  THEN volume ELSE 0 END) AS bought,
      SUM(CASE WHEN type = 'SELL' THEN volume ELSE 0 END) AS sold
    FROM (
      SELECT buyDate  AS date, 'BUY'  AS type, quantity * buyPrice  AS volume FROM buys
      UNION ALL
      SELECT sellDate AS date, 'SELL' AS type, quantity * sellPrice AS volume FROM sells
    )
    GROUP BY month
    ORDER BY month ASC;
  `);
	return (result.values ?? []) as MonthlyTransaction[];
}

// ─── Debug ─────────────────────────────────────────────────────────────────
export async function runCustomQuery(query: string) {
	const db = await getDB();

	const result = await db.query(query);
	return result.values ?? [];
}
