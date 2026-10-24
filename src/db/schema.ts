import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'przepisy.db';

/**
 * Uruchamiane przy otwarciu bazy (SQLiteProvider onInit).
 * Wersja schematu trzymana w PRAGMA user_version — kolejne migracje dopisujemy jako `if (version < N)`.
 */
export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        instructions TEXT NOT NULL DEFAULT '',
        image_uri TEXT,
        servings INTEGER NOT NULL DEFAULT 2,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        quantity REAL,
        unit TEXT NOT NULL DEFAULT '',
        position INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX idx_ingredients_recipe ON recipe_ingredients(recipe_id);

      -- unit jest NOT NULL ('' = brak jednostki), bo NULL-e w indeksie UNIQUE nigdy nie kolidują
      CREATE TABLE shopping_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_key TEXT NOT NULL,
        quantity REAL,
        unit TEXT NOT NULL DEFAULT '',
        checked INTEGER NOT NULL DEFAULT 0,
        source_recipes TEXT NOT NULL DEFAULT ''
      );
      CREATE UNIQUE INDEX idx_shopping_key ON shopping_items(name_key, unit);
    `);
    version = 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }

  if (version < 2) {
    // etykiety przepisu jako lista id rozdzielona przecinkami, np. "sniadanie,wege"
    await db.execAsync(`ALTER TABLE recipes ADD COLUMN tags TEXT NOT NULL DEFAULT ''`);
    version = 2;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}
