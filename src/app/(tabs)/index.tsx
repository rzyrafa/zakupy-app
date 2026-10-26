import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { Logo } from '@/components/logo';
import { Marquee } from '@/components/marquee';
import { PillInput } from '@/components/pill-input';
import { RoundBadge } from '@/components/round-badge';
import { TagChip } from '@/components/tag-chip';
import { AppText } from '@/components/text';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { listRecipes, type RecipeListItem } from '@/db/recipes';
import { parseTags, TAGS } from '@/lib/tags';
import { ingredientsLabel, servingsWord } from '@/lib/units';

// kolory zastępcze dla przepisów bez zdjęcia i kolory plakietek — rotowane po id
const PLACEHOLDERS = [Palette.pink, Palette.sky, Palette.sunshine, Palette.lavender];
const BADGES = [Palette.terracotta, Palette.ink, Palette.moss];

// wysokość jednego rzędu bento (duży kafel + dwa małe) i pojedynczego szerokiego kafla
const GROUP_HEIGHT = 300;
const WIDE_HEIGHT = 200;

type TileSize = 'large' | 'small' | 'wide';

function BentoTile({ item, size, style }: { item: RecipeListItem; size: TileSize; style?: ViewStyle }) {
  const small = size === 'small';
  const tags = parseTags(item.tags).slice(0, 2);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: String(item.id) } })}
      accessibilityLabel={`Otwórz ${item.title}`}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: PLACEHOLDERS[item.id % PLACEHOLDERS.length] },
        style,
        pressed && { opacity: 0.85 },
      ]}>
      {item.image_uri ? (
        <Image source={{ uri: item.image_uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.tileEmpty]}>
          <Ionicons name="restaurant" size={small ? 32 : 48} color={Palette.ink} />
        </View>
      )}
      <View style={styles.tileTop}>
        <RoundBadge
          top={String(item.servings)}
          bottom={small ? undefined : servingsWord(item.servings)}
          color={BADGES[item.id % BADGES.length]}
          size={small ? 40 : 64}
        />
        {!small && tags.length > 0 && (
          <View style={styles.tileTags}>
            {tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} small />
            ))}
          </View>
        )}
      </View>
      <View style={[styles.tileCaption, small && styles.tileCaptionSmall]}>
        <AppText variant={small ? 'bold' : 'heading'} numberOfLines={2} style={small && styles.tileTitleSmall}>
          {item.title}
        </AppText>
        {!small && (
          <AppText variant="label" color={Palette.inkMuted}>
            {ingredientsLabel(item.ingredient_count)}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

/** Rząd bento: 3 przepisy (duży + dwa małe, co drugi rząd lustrzanie), 2 obok siebie albo 1 szeroki. */
function BentoGroup({ items, mirrored }: { items: RecipeListItem[]; mirrored: boolean }) {
  if (items.length === 1) {
    return (
      <View style={styles.group}>
        <BentoTile item={items[0]} size="wide" style={{ height: WIDE_HEIGHT, flex: 1 }} />
      </View>
    );
  }
  if (items.length === 2) {
    return (
      <View style={[styles.group, { height: WIDE_HEIGHT + 40 }]}>
        <BentoTile item={items[0]} size="large" style={styles.flex} />
        <BentoTile item={items[1]} size="large" style={styles.flex} />
      </View>
    );
  }
  const [big, a, b] = items;
  return (
    <View style={[styles.group, { height: GROUP_HEIGHT }, mirrored && styles.groupMirrored]}>
      <BentoTile item={big} size="large" style={styles.flex} />
      <View style={[styles.flex, styles.column]}>
        <BentoTile item={a} size="small" style={styles.flex} />
        <BentoTile item={b} size="small" style={styles.flex} />
      </View>
    </View>
  );
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export default function RecipesScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const groups = useMemo(() => chunk(recipes, 3), [recipes]);

  useFocusEffect(
    useCallback(() => {
      listRecipes(db, search, tagFilter).then(setRecipes);
    }, [db, search, tagFilter])
  );

  // jasne ikony paska statusu na terakotowym pasie
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  return (
    <View style={styles.screen}>
      <View style={{ height: insets.top, backgroundColor: Palette.terracotta }} />
      <FlatList
        data={groups}
        keyExtractor={(g) => String(g[0].id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <AppText variant="label" color={Palette.cream}>
                  Twoje obiady
                </AppText>
                <IconButton
                  icon="settings-sharp"
                  size={40}
                  onPress={() => router.push('/settings')}
                  accessibilityLabel="Ustawienia"
                />
              </View>
              <Logo />
              <AppText color={Palette.cream}>Przepisy, które znasz. Lista zakupów, która sama się robi.</AppText>
            </View>
            <Marquee />
            <View style={styles.searchWrap}>
              <PillInput
                value={search}
                onChangeText={setSearch}
                placeholder="SZUKAJ PRZEPISU"
                right={<Ionicons name="search" size={20} color={Palette.ink} />}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              <Pressable
                onPress={() => setTagFilter('')}
                style={[styles.allChip, !tagFilter && styles.allChipActive]}>
                <AppText variant="label" color={tagFilter ? Palette.ink : Palette.cream}>
                  Wszystko
                </AppText>
              </Pressable>
              {TAGS.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  selected={tagFilter === tag.id}
                  onPress={() => setTagFilter(tagFilter === tag.id ? '' : tag.id)}
                />
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          search || tagFilter ? (
            <EmptyState icon="search" title="Brak wyników" message="Żaden przepis nie pasuje do wyszukiwania." />
          ) : (
            <EmptyState icon="book" title="Nie masz jeszcze przepisów" message="Dodaj pierwszy przepis w zakładce Nowy.">
              <Button title="Dodaj przepis" icon="add" onPress={() => router.navigate('/create')} />
            </EmptyState>
          )
        }
        renderItem={({ item, index }) => <BentoGroup items={item} mirrored={index % 2 === 1} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.sage },
  list: { paddingBottom: Spacing.eight, gap: Spacing.three },
  hero: {
    backgroundColor: Palette.terracotta,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchWrap: { paddingHorizontal: Spacing.five, paddingTop: Spacing.five },
  filters: { paddingHorizontal: Spacing.five, paddingTop: Spacing.three, gap: Spacing.two },
  allChip: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.cream,
  },
  allChipActive: { backgroundColor: Palette.ink },
  flex: { flex: 1 },
  group: { flexDirection: 'row', gap: Spacing.three, marginHorizontal: Spacing.five },
  groupMirrored: { flexDirection: 'row-reverse' },
  column: { gap: Spacing.three },
  tile: {
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.card,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: Spacing.two,
  },
  tileEmpty: { alignItems: 'center', justifyContent: 'center' },
  tileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  tileTags: { flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 4 },
  tileCaption: {
    backgroundColor: Palette.cream,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.card - 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  tileCaptionSmall: { paddingHorizontal: Spacing.two, paddingVertical: 6 },
  tileTitleSmall: { fontSize: 14, lineHeight: 18 },
});
