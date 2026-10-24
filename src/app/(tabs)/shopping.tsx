import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { PillInput } from '@/components/pill-input';
import { AppText } from '@/components/text';
import { UnitPicker } from '@/components/unit-picker';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { listRecipes, type RecipeListItem } from '@/db/recipes';
import {
  addRecipeToShoppingList,
  addShoppingItem,
  clearShoppingList,
  deleteCheckedItems,
  deleteShoppingItem,
  listShoppingItems,
  setItemChecked,
  type ShoppingItem,
} from '@/db/shopping';
import { formatAmount, parseQuantity } from '@/lib/units';

export default function ShoppingScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);

  const reload = useCallback(() => listShoppingItems(db).then(setItems), [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const addManual = async () => {
    if (!name.trim()) return;
    await addShoppingItem(db, { name, quantity: parseQuantity(quantity), unit });
    setName('');
    setQuantity('');
    setUnit('');
    reload();
  };

  const toggle = async (item: ShoppingItem) => {
    await setItemChecked(db, item.id, !item.checked);
    reload();
  };

  const openImport = async () => {
    setRecipes(await listRecipes(db));
    setImportOpen(true);
  };

  const importRecipe = async (recipe: RecipeListItem) => {
    setImportOpen(false);
    await addRecipeToShoppingList(db, recipe.id);
    reload();
  };

  const confirmClear = () =>
    Alert.alert('Wyczyścić listę?', 'Wszystkie pozycje zostaną usunięte.', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Wyczyść', style: 'destructive', onPress: () => clearShoppingList(db).then(reload) },
    ]);

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <View style={styles.screen}>
      <View style={styles.addBar}>
        <View style={styles.row}>
          <PillInput
            value={name}
            onChangeText={setName}
            placeholder="PRODUKT"
            onSubmitEditing={addManual}
            returnKeyType="done"
            containerStyle={styles.flex}
          />
          <PillInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="ILE"
            keyboardType="decimal-pad"
            containerStyle={styles.qty}
          />
          <UnitPicker value={unit} onChange={setUnit} />
        </View>
        <View style={styles.row}>
          <Button title="Importuj przepis" icon="download" variant="outline" onPress={openImport} style={styles.flex} />
          <IconButton icon="add" size={48} onPress={addManual} accessibilityLabel="Dodaj produkt" />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="cart"
            title="Lista zakupów jest pusta"
            message="Dodaj produkt ręcznie albo zaimportuj składniki z przepisu."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggle(item)}
            onLongPress={() => deleteShoppingItem(db, item.id).then(reload)}
            style={[styles.item, item.checked ? styles.itemChecked : null]}>
            <View style={[styles.check, item.checked ? styles.checkOn : null]}>
              {!!item.checked && <Ionicons name="checkmark" size={18} color={Palette.cream} />}
            </View>
            <View style={styles.flex}>
              <AppText variant="bold" style={item.checked ? styles.strike : undefined}>
                {item.name}
              </AppText>
              {!!item.source_recipes && (
                <AppText variant="small" color={Palette.inkMuted} numberOfLines={1}>
                  {item.source_recipes}
                </AppText>
              )}
            </View>
            <AppText variant="bold">{formatAmount(item.quantity, item.unit)}</AppText>
          </Pressable>
        )}
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.footer}>
              <AppText variant="small" style={styles.center}>
                Dotknij, aby odhaczyć. Przytrzymaj, aby usunąć.
              </AppText>
              <View style={styles.row}>
                <Button
                  title={`Usuń kupione (${checkedCount})`}
                  variant="outline"
                  disabled={checkedCount === 0}
                  onPress={() => deleteCheckedItems(db).then(reload)}
                  style={styles.flex}
                />
                <Button title="Wyczyść" variant="danger" onPress={confirmClear} />
              </View>
            </View>
          ) : undefined
        }
      />

      <Modal visible={importOpen} animationType="slide" onRequestClose={() => setImportOpen(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.modalHeader}>
            <AppText variant="heading">Wybierz przepis</AppText>
            <IconButton icon="close" size={40} onPress={() => setImportOpen(false)} accessibilityLabel="Zamknij" />
          </View>
          <FlatList
            data={recipes}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState icon="book" title="Brak przepisów do zaimportowania" />}
            renderItem={({ item }) => (
              <Pressable onPress={() => importRecipe(item)} style={styles.item}>
                <Ionicons name="restaurant" size={22} color={Palette.terracotta} />
                <AppText variant="bold" style={styles.flex}>
                  {item.title}
                </AppText>
                <AppText variant="label" color={Palette.inkMuted}>
                  {item.ingredient_count} skł.
                </AppText>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.sky },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  addBar: {
    padding: Spacing.five,
    gap: Spacing.three,
    borderBottomWidth: Border,
    borderBottomColor: Palette.ink,
  },
  qty: { width: 76, paddingHorizontal: 12 },
  list: { padding: Spacing.five, gap: Spacing.three, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    backgroundColor: Palette.cream,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.card,
  },
  itemChecked: { opacity: 0.55 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: Border,
    borderColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: Palette.ink },
  strike: { textDecorationLine: 'line-through' },
  footer: { gap: Spacing.three, marginTop: Spacing.three },
  modal: { flex: 1, backgroundColor: Palette.pink },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.four,
    borderBottomWidth: Border,
    borderBottomColor: Palette.ink,
  },
});
