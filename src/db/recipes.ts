import type { SQLiteDatabase } from 'expo-sqlite';

import { deleteImage } from '@/lib/images';
import { serializeTags } from '@/lib/tags';

export type Ingredient = {
  name: string;
  quantity: number | null;
  unit: string;
};

export type RecipeInput = {
  title: string;
  instructions: string;
  imageUri: string | null;
  servings: number;
  /** id etykiet, np. ['obiad', 'wege'] */
  tags: string[];
  ingredients: Ingredient[];
};

export type RecipeListItem = {
  id: number;
  title: string;
  image_uri: string | null;
  servings: number;
  /** id etykiet rozdzielone przecinkami — do odczytu przez parseTags() */
  tags: string;
  ingredient_count: number;
};

export type Recipe = {
  id: number;
  title: string;
  instructions: string;
  image_uri: string | null;
  servings: number;
  tags: string;
  created_at: number;
  ingredients: Ingredient[];
};

/** Lista przepisów; `tag` (id etykiety) zawęża do przepisów z tą etykietą. */
export async function listRecipes(db: SQLiteDatabase, search = '', tag = ''): Promise<RecipeListItem[]> {
  return db.getAllAsync<RecipeListItem>(
    `SELECT r.id, r.title, r.image_uri, r.servings, r.tags,
            (SELECT COUNT(*) FROM recipe_ingredients i WHERE i.recipe_id = r.id) AS ingredient_count
       FROM recipes r
      WHERE r.title LIKE ?
        AND (? = '' OR (',' || r.tags || ',') LIKE ?)
      ORDER BY r.created_at DESC`,
    `%${search.trim()}%`,
    tag,
    `%,${tag},%`
  );
}

export async function getRecipe(db: SQLiteDatabase, id: number): Promise<Recipe | null> {
  const recipe = await db.getFirstAsync<Omit<Recipe, 'ingredients'>>(
    'SELECT id, title, instructions, image_uri, servings, tags, created_at FROM recipes WHERE id = ?',
    id
  );
  if (!recipe) return null;

  const ingredients = await db.getAllAsync<Ingredient>(
    'SELECT name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ? ORDER BY position',
    id
  );
  return { ...recipe, ingredients };
}

/** Tworzy nowy przepis (gdy brak `id`) albo nadpisuje istniejący. Zwraca id przepisu. */
export async function saveRecipe(db: SQLiteDatabase, input: RecipeInput, id?: number): Promise<number> {
  let recipeId = id ?? 0;

  await db.withExclusiveTransactionAsync(async (tx) => {
    if (id) {
      await tx.runAsync(
        'UPDATE recipes SET title = ?, instructions = ?, image_uri = ?, servings = ?, tags = ? WHERE id = ?',
        input.title,
        input.instructions,
        input.imageUri,
        input.servings,
        serializeTags(input.tags),
        id
      );
      await tx.runAsync('DELETE FROM recipe_ingredients WHERE recipe_id = ?', id);
    } else {
      const result = await tx.runAsync(
        'INSERT INTO recipes (title, instructions, image_uri, servings, tags, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        input.title,
        input.instructions,
        input.imageUri,
        input.servings,
        serializeTags(input.tags),
        Date.now()
      );
      recipeId = result.lastInsertRowId;
    }

    for (const [position, ing] of input.ingredients.entries()) {
      await tx.runAsync(
        'INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, position) VALUES (?, ?, ?, ?, ?)',
        recipeId,
        ing.name,
        ing.quantity,
        ing.unit,
        position
      );
    }
  });

  return recipeId;
}

export async function deleteRecipe(db: SQLiteDatabase, id: number) {
  const recipe = await db.getFirstAsync<{ image_uri: string | null }>(
    'SELECT image_uri FROM recipes WHERE id = ?',
    id
  );
  await db.runAsync('DELETE FROM recipes WHERE id = ?', id);
  deleteImage(recipe?.image_uri);
}
