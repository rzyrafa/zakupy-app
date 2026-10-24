import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { RecipeForm } from '@/components/recipe-form';
import { Palette } from '@/constants/theme';
import { getRecipe, type Recipe } from '@/db/recipes';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);

  useEffect(() => {
    getRecipe(db, Number(id)).then(setRecipe);
  }, [db, id]);

  if (recipe === undefined) return <ActivityIndicator color={Palette.ink} style={{ marginTop: 48 }} />;
  if (recipe === null) return <EmptyState icon="alert-circle" title="Nie znaleziono przepisu" />;

  return <RecipeForm initial={recipe} onSaved={() => router.back()} />;
}
