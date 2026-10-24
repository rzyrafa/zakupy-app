import type { SQLiteDatabase } from 'expo-sqlite';

import type { Ingredient } from '@/db/recipes';

export type ShoppingItem = {
  id: number;
  name: string;
  quantity: number | null;
  unit: string;
  checked: number;
  source_recipes: string;
};

export function nameKey(name: string) {
  return name.trim().toLowerCase();
}

export async function listShoppingItems(db: SQLiteDatabase): Promise<ShoppingItem[]> {
  return db.getAllAsync<ShoppingItem>(
    'SELECT id, name, quantity, unit, checked, source_recipes FROM shopping_items ORDER BY checked, name_key'
  );
}

/**
 * Dodaje produkt do listy. Jeśli ten sam produkt (nazwa bez względu na wielkość liter + jednostka)
 * już jest, ilości się sumują, a pozycja wraca na „do kupienia”.
 */
async function upsertItem(db: SQLiteDatabase, item: Ingredient, source: string) {
  await db.runAsync(
    `INSERT INTO shopping_items (name, name_key, quantity, unit, checked, source_recipes)
     VALUES (?, ?, ?, ?, 0, ?)
     ON CONFLICT(name_key, unit) DO UPDATE SET
       quantity = CASE
         WHEN shopping_items.quantity IS NULL THEN excluded.quantity
         WHEN excluded.quantity IS NULL THEN shopping_items.quantity
         ELSE shopping_items.quantity + excluded.quantity
       END,
       checked = 0,
       source_recipes = CASE
         WHEN excluded.source_recipes = '' THEN shopping_items.source_recipes
         WHEN shopping_items.source_recipes = '' THEN excluded.source_recipes
         WHEN instr(shopping_items.source_recipes, excluded.source_recipes) > 0 THEN shopping_items.source_recipes
         ELSE shopping_items.source_recipes || ', ' || excluded.source_recipes
       END`,
    item.name.trim(),
    nameKey(item.name),
    item.quantity,
    item.unit,
    source
  );
}

export async function addShoppingItem(db: SQLiteDatabase, item: Ingredient) {
  await upsertItem(db, item, '');
}

/** Dodaje wszystkie składniki przepisu; `multiplier` skaluje ilości (np. 2 = podwójna porcja). */
export async function addRecipeToShoppingList(db: SQLiteDatabase, recipeId: number, multiplier = 1) {
  const recipe = await db.getFirstAsync<{ title: string }>('SELECT title FROM recipes WHERE id = ?', recipeId);
  if (!recipe) return 0;

  const ingredients = await db.getAllAsync<Ingredient>(
    'SELECT name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ? ORDER BY position',
    recipeId
  );

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const ing of ingredients) {
      const quantity = ing.quantity == null ? null : Math.round(ing.quantity * multiplier * 100) / 100;
      await upsertItem(tx, { ...ing, quantity }, recipe.title);
    }
  });
  return ingredients.length;
}

export async function setItemChecked(db: SQLiteDatabase, id: number, checked: boolean) {
  await db.runAsync('UPDATE shopping_items SET checked = ? WHERE id = ?', checked ? 1 : 0, id);
}

export async function deleteShoppingItem(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM shopping_items WHERE id = ?', id);
}

export async function deleteCheckedItems(db: SQLiteDatabase) {
  await db.runAsync('DELETE FROM shopping_items WHERE checked = 1');
}

export async function clearShoppingList(db: SQLiteDatabase) {
  await db.runAsync('DELETE FROM shopping_items');
}
