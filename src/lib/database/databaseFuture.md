Below is a **clear, modern, production-ready architecture** for a Svelte (or SvelteKit) app that becomes a **Capacitor Android app** and uses **SQLite**.
This includes:
✔ recommended folder structure
✔ database layer design
✔ data access patterns
✔ offline/online sync options
✔ alternatives you should consider
✔ performance & reliability tips

This is distilled from real-world hybrid app patterns (Ionic, Capacitor, RN, Flutter + SQLite).

---

# ✅ **1. Recommended Folder Structure**

```
src/
 ├─ lib/
 │   ├─ db/
 │   │   ├─ sqlite.ts            # initializes connection, singleton
 │   │   ├─ schema.ts            # SQL table definitions + migrations
 │   │   ├─ buys.ts              # data-access layer for buys
 │   │   ├─ sells.ts             # data-access layer for sells
 │   │   └─ utils.ts             # helpers (query builder, validation, logs)
 │   ├─ stores/
 │   │   ├─ tradesStore.ts       # Svelte store (derived from buys + sells)
 │   │   └─ settingsStore.ts
 │   ├─ models/
 │   │   ├─ Buy.ts               # TypeScript interfaces & types
 │   │   └─ Sell.ts
 │   └─ utils/
 │       └─ formatters.ts        # dates, numbers, currency
 ├─ routes/
 │   ├─ home.svelte
 │   ├─ buys.svelte
 │   ├─ sells.svelte
 │   └─ stats.svelte
 ├─ app.css
 └─ app.html
```

### Why this is good

* **UI layer** (Svelte) stays separate from **data layer** (database).
* Database code is modular and testable.
* Easy to switch from SQLite → IndexedDB → REST API later.
* Stores ensure reactive UI updates.

---

# ✅ **2. Create a Strong DB Layer (SQLite wrapper)**

A good DB layer looks like this:

## `src/lib/db/sqlite.ts`

✔ Initializes the DB connection
✔ Ensures connection is open
✔ Provides a safe `getDB()` function
✔ No SQL logic inside here

```ts
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { createTables, runMigrations } from './schema';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

export async function getDB(): Promise<SQLiteDBConnection> {
  if (db) return db;
  if (!Capacitor.isNativePlatform()) throw new Error("SQLite available only on native.");

  const connExists = (await sqlite.isConnection('trades_db', false)).result;

  db = connExists ?
    await sqlite.retrieveConnection('trades_db', false) :
    await sqlite.createConnection('trades_db', false, 'no-encryption', 1, false);

  await db.open();
  await createTables(db);
  await runMigrations(db);
  
  return db;
}
```

---

# ✅ **3. Database Schema & Migrations**

Put schema in its own file so it doesn’t clutter your logic.

### `src/lib/db/schema.ts`

```ts
export async function createTables(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS buys (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      buyDate TEXT NOT NULL,
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
      sellDate TEXT NOT NULL,
      quantity REAL NOT NULL,
      sellPrice REAL NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      FOREIGN KEY (buyId) REFERENCES buys(id)
    );
  `);
}
```

You can also add versioned migrations:

```ts
export async function runMigrations(db) {
  // example if you add columns later
  await db.execute(`
    PRAGMA user_version = 1;
  `);
}
```

---

# ✅ **4. Data Access Layer (DAL)**

Every table gets its own module.
This prevents SQL from leaking into your UI.

### Example: `src/lib/db/buys.ts`

```ts
import { getDB } from './sqlite';

export async function createBuy(data) {
  const db = await getDB();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.run(
    `INSERT INTO buys (id, symbol, buyDate, quantity, buyPrice, note, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.symbol, data.buyDate, data.quantity, data.buyPrice, data.note, now, now]
  );

  return id;
}

export async function getAllBuys() {
  const db = await getDB();
  const result = await db.query(`SELECT * FROM buys ORDER BY buyDate DESC`);
  return result.values ?? [];
}
```

---

# ✅ **5. Svelte Stores (Reactive State Layer)**

UI watches the DB via stores.
Database changes → store updates → UI updates.

```ts
import { writable } from 'svelte/store';
import { getAllBuys } from '$lib/db/buys';

export const buysStore = writable([]);

export async function refreshBuys() {
  const buys = await getAllBuys();
  buysStore.set(buys);
}
```

---

# ⭐ **This Architecture Has Huge Benefits**

* Clean separation:
  **UI ↔ store ↔ DAL ↔ DB**
  (each layer is replaceable)
* You can add:

  * cloud sync
  * caching
  * migrations
  * encryption
  * unit testing
* Prevents spaghetti SQL in random UI components.

---

# 🧠 **OPTIONAL: Better Alternatives Depending on Your Goals**

If your app grows, here are alternatives to think about:

---

## ⭐ **(1) SQLite → Better SQLite Wrapper: Drizzle ORM (best option)**

Drizzle now works with:

* SQLite
* Capacitor
* SvelteKit
* Typed queries!

You get:
✔ Type safety
✔ Schema migrations
✔ Auto-generated queries
✔ Zero SQL string errors

---

## ⭐ **(2) Use IndexedDB instead of SQLite**

**When to use it:**

* Pure web app AND Android/iOS using Capacitor (still supported)
* You don't need heavy joins
* You want simpler persistence

Downside → slower on large datasets.

---

## ⭐ **(3) Local-first DB like **RxDB*** (syncs offline to online)

If you eventually want:

* Backup to cloud
* Sync to desktop app
* Collaborative editing

Then RxDB or ElectricSQL becomes ideal.

---

# ⭐ **(4) Use Supabase for Cloud Sync + SQLite Locally**

Best hybrid option:

* SQLite locally on device
* Supabase API syncs data periodically
* Allows multi-device trading journal

This is the architecture that 90% of modern productivity apps use.

---

# 🧱 **FINAL RECOMMENDATION FOR YOUR TRADING JOURNAL APP**

### ✔ Stay with SQLite

Because trading data needs:

* joins
* reliable transactions
* fast queries
* offline-first behavior
* complex calculations

### ✔ Use the modular architecture above

Your code stays clean and scalable.

### ✔ Optionally add Drizzle ORM later

Gives you typed SQL and migrations.