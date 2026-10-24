import { Image } from 'expo-image';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { RoundBadge } from '@/components/round-badge';
import { Stepper } from '@/components/stepper';
import { TagChip } from '@/components/tag-chip';
import { AppText } from '@/components/text';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { deleteRecipe, getRecipe, type Recipe } from '@/db/recipes';
import { addRecipeToShoppingList } from '@/db/shopping';
import { parseTags } from '@/lib/tags';
import { formatAmount, ingredientsLabel, servingsWord } from '@/lib/units';

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [servings, setServings] = useState(2);

  useFocusEffect(
    useCallback(() => {
      getRecipe(db, Number(id)).then((r) => {
        setRecipe(r);
        if (r) setServings(r.servings);
      });
    }, [db, id])
  );

  if (recipe === undefined) return <ActivityIndicator color={Palette.ink} style={{ marginTop: 48 }} />;
  if (recipe === null) return <EmptyState icon="alert-circle" title="Nie znaleziono przepisu" />;

  const multiplier = servings / recipe.servings;

  const addToList = async () => {
    const count = await addRecipeToShoppingList(db, recipe.id, multiplier);
    Alert.alert('Dodano do listy', `Na listę zakupów: ${ingredientsLabel(count)} z „${recipe.title}”.`, [
      { text: 'OK' },
      { text: 'Pokaż listę', onPress: () => router.navigate('/shopping') },
    ]);
  };

  const confirmDelete = () =>
    Alert.alert('Usunąć przepis?', `„${recipe.title}” zostanie trwale usunięty.`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          await deleteRecipe(db, recipe.id);
          router.back();
        },
      },
    ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: recipe.title }} />

      {recipe.image_uri && (
        <View>
          <Image source={{ uri: recipe.image_uri }} style={styles.image} contentFit="cover" />
          <RoundBadge top={String(servings)} bottom={servingsWord(servings)} size={84} style={styles.badge} />
        </View>
      )}

      <AppText variant="display">{recipe.title}</AppText>
      {!!recipe.tags && (
        <View style={styles.tags}>
          {parseTags(recipe.tags).map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
        </View>
      )}

      <View style={styles.row}>
        <AppText variant="label">Składniki</AppText>
        <Stepper value={servings} onChange={setServings} suffix={servingsWord(servings)} />
      </View>

      <Card style={styles.ingredients}>
        {recipe.ingredients.map((ing, i) => (
          <View key={i} style={[styles.ingredient, i > 0 && styles.ingredientDivider]}>
            <AppText style={styles.flex}>{ing.name}</AppText>
            <AppText variant="bold">
              {formatAmount(ing.quantity == null ? null : ing.quantity * multiplier, ing.unit)}
            </AppText>
          </View>
        ))}
      </Card>

      <Button title="Dodaj do listy zakupów" icon="cart" onPress={addToList} />

      <Card color={Palette.moss} bordered={false}>
        <AppText variant="bold" color={Palette.cream} style={styles.underline}>
          PRZYGOTOWANIE
        </AppText>
        <AppText color={Palette.cream} style={styles.instructions}>
          {recipe.instructions || 'Brak opisu przygotowania.'}
        </AppText>
      </Card>

      <View style={styles.row}>
        <Button
          title="Edytuj"
          icon="create"
          variant="outline"
          style={styles.flex}
          onPress={() => router.push({ pathname: '/recipe/edit/[id]', params: { id: String(recipe.id) } })}
        />
        <Button title="Usuń" icon="trash" variant="danger" style={styles.flex} onPress={confirmDelete} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Palette.sunshine },
  container: { padding: Spacing.five, gap: Spacing.five, paddingBottom: 48 },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.card,
    borderWidth: Border,
    borderColor: Palette.ink,
  },
  badge: { position: 'absolute', top: 14, left: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  flex: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: -Spacing.two },
  ingredients: { paddingVertical: Spacing.one, gap: 0 },
  ingredient: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three, gap: Spacing.three },
  ingredientDivider: { borderTopWidth: 1, borderTopColor: Palette.ink },
  underline: { textDecorationLine: 'underline' },
  instructions: { lineHeight: 24 },
});
