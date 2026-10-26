import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Button, IconButton } from '@/components/button';
import { Card } from '@/components/card';
import { PillInput } from '@/components/pill-input';
import { Stepper } from '@/components/stepper';
import { TagChip } from '@/components/tag-chip';
import { AppText } from '@/components/text';
import { UnitPicker } from '@/components/unit-picker';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { type Recipe, saveRecipe } from '@/db/recipes';
import { NoApiKeyError, rewriteInstructions } from '@/lib/deepseek';
import { deleteImage, persistImage, pickImage } from '@/lib/images';
import { parseTags, TAGS } from '@/lib/tags';
import { formatQuantity, parseQuantity } from '@/lib/units';

type IngredientRow = { key: number; name: string; quantity: string; unit: string };

// unikalne klucze wierszy składników (tylko dla Reacta, nie trafiają do bazy)
let nextKey = 0;
const newRow = (name = '', quantity = '', unit = ''): IngredientRow => ({ key: nextKey++, name, quantity, unit });

type Props = {
  /** Przekazany przepis = tryb edycji. */
  initial?: Recipe;
  onSaved: (id: number) => void;
};

export function RecipeForm({ initial, onSaved }: Props) {
  const db = useSQLiteContext();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [imageUri, setImageUri] = useState<string | null>(initial?.image_uri ?? null);
  const [servings, setServings] = useState(initial?.servings ?? 2);
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [tags, setTags] = useState<string[]>(() => parseTags(initial?.tags ?? '').map((t) => t.id));
  const [rows, setRows] = useState<IngredientRow[]>(() =>
    initial?.ingredients.length
      ? initial.ingredients.map((i) => newRow(i.name, formatQuantity(i.quantity), i.unit))
      : [newRow()]
  );
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  // wersja sprzed przepisania przez AI (do cofnięcia)
  const [previousInstructions, setPreviousInstructions] = useState<string | null>(null);

  const updateRow = (key: number, patch: Partial<IngredientRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: number) =>
    setRows((prev) => (prev.length === 1 ? [newRow()] : prev.filter((r) => r.key !== key)));

  const toggleTag = (id: string) =>
    setTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const choosePhoto = async (source: 'library' | 'camera') => {
    const uri = await pickImage(source);
    if (uri) setImageUri(uri);
  };

  const collectIngredients = () =>
    rows
      .filter((r) => r.name.trim())
      .map((r) => ({ name: r.name.trim(), quantity: parseQuantity(r.quantity), unit: r.unit }));

  const handleRewrite = async () => {
    if (!instructions.trim())
      return Alert.alert('Brak opisu', 'Najpierw wpisz krótki opis, a AI ułoży go w czytelne kroki.');

    setRewriting(true);
    try {
      const result = await rewriteInstructions({
        title: title.trim(),
        ingredients: collectIngredients(),
        instructions: instructions.trim(),
      });
      setPreviousInstructions(instructions);
      setInstructions(result);
    } catch (e) {
      if (e instanceof NoApiKeyError) {
        Alert.alert('Brak klucza API', 'Dodaj klucz DeepSeek w ustawieniach.', [
          { text: 'Anuluj', style: 'cancel' },
          { text: 'Ustawienia', onPress: () => router.push('/settings') },
        ]);
      } else {
        Alert.alert('Błąd AI', e instanceof Error ? e.message : String(e));
      }
    } finally {
      setRewriting(false);
    }
  };

  const handleSave = async () => {
    const ingredients = collectIngredients();

    if (!title.trim()) return Alert.alert('Brak nazwy', 'Podaj nazwę przepisu.');
    if (ingredients.length === 0) return Alert.alert('Brak składników', 'Dodaj przynajmniej jeden składnik.');

    setSaving(true);
    try {
      const storedUri = imageUri ? await persistImage(imageUri) : null;
      const id = await saveRecipe(
        db,
        { title: title.trim(), instructions: instructions.trim(), imageUri: storedUri, servings, tags, ingredients },
        initial?.id
      );
      if (initial?.image_uri && initial.image_uri !== storedUri) deleteImage(initial.image_uri);
      onSaved(id);
    } catch (e) {
      Alert.alert('Błąd zapisu', String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    // przewija się sam tak, żeby pole z kursorem było nad klawiaturą
    <KeyboardAwareScrollView
      bottomOffset={32}
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Card>
        <AppText variant="label">Nazwa</AppText>
        <PillInput value={title} onChangeText={setTitle} placeholder="NP. SPAGHETTI BOLOGNESE" />
      </Card>

      <Card>
        <AppText variant="label">Etykiety</AppText>
        <View style={styles.tags}>
          {TAGS.map((tag) => (
            <TagChip key={tag.id} tag={tag} selected={tags.includes(tag.id)} onPress={() => toggleTag(tag.id)} />
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="label">Zdjęcie</AppText>
        {imageUri ? (
          <View>
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
            <View style={styles.removeImage}>
              <IconButton icon="close" size={36} onPress={() => setImageUri(null)} accessibilityLabel="Usuń zdjęcie" />
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={44} color={Palette.ink} />
            <AppText variant="label">Dodaj zdjęcie dania</AppText>
          </View>
        )}
        <View style={styles.row}>
          <Button title="Galeria" icon="images" variant="outline" onPress={() => choosePhoto('library')} style={styles.flex} />
          <Button title="Aparat" icon="camera" variant="outline" onPress={() => choosePhoto('camera')} style={styles.flex} />
        </View>
      </Card>

      <Card>
        <AppText variant="label">Porcje</AppText>
        <Stepper value={servings} onChange={setServings} />
      </Card>

      <Card>
        <AppText variant="label">Składniki</AppText>
        {rows.map((row, i) => (
          <View key={row.key} style={[styles.ingredient, i > 0 && styles.ingredientDivider]}>
            <PillInput
              value={row.name}
              onChangeText={(name) => updateRow(row.key, { name })}
              placeholder="PRODUKT"
            />
            <View style={styles.row}>
              <PillInput
                value={row.quantity}
                onChangeText={(quantity) => updateRow(row.key, { quantity })}
                placeholder="ILOŚĆ"
                keyboardType="decimal-pad"
                containerStyle={styles.flex}
              />
              <UnitPicker value={row.unit} onChange={(unit) => updateRow(row.key, { unit })} />
              <IconButton
                icon="trash"
                size={44}
                color={Palette.cream}
                iconColor={Palette.ink}
                onPress={() => removeRow(row.key)}
                accessibilityLabel="Usuń składnik"
              />
            </View>
          </View>
        ))}
        <Button title="Dodaj składnik" icon="add" variant="moss" onPress={() => setRows((p) => [...p, newRow()])} />
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <AppText variant="label" style={styles.flex}>
            Sposób przygotowania
          </AppText>
          {rewriting ? (
            <View style={styles.aiSpinner}>
              <ActivityIndicator color={Palette.ink} />
            </View>
          ) : (
            <IconButton
              icon="sparkles"
              size={40}
              color={Palette.lavender}
              iconColor={Palette.ink}
              onPress={handleRewrite}
              accessibilityLabel="Popraw opis z AI"
            />
          )}
        </View>
        <PillInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Opisz krótko, jak przygotować danie. Przycisk AI ułoży to w kroki…"
          multiline
          editable={!rewriting}
        />
        {previousInstructions !== null && (
          <Button
            title="Cofnij zmiany AI"
            icon="arrow-undo"
            variant="outline"
            onPress={() => {
              setInstructions(previousInstructions);
              setPreviousInstructions(null);
            }}
          />
        )}
      </Card>

      <Button
        title={initial ? 'Zapisz zmiany' : 'Zapisz przepis'}
        icon="checkmark"
        onPress={handleSave}
        disabled={saving}
        style={styles.save}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Palette.sunshine },
  container: { padding: Spacing.five, gap: Spacing.five, paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  aiSpinner: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  ingredient: { gap: Spacing.two },
  ingredientDivider: { borderTopWidth: 1, borderTopColor: Palette.ink, paddingTop: Spacing.three },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: Radius.card - 6, borderWidth: Border, borderColor: Palette.ink },
  removeImage: { position: 'absolute', top: 10, right: 10 },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.card - 6,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  save: { minHeight: 56 },
});
