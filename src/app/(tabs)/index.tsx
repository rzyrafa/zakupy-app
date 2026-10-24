import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

function RecipeCard({ item }: { item: RecipeListItem }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: String(item.id) } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View>
        {item.image_uri ? (
          <Image source={{ uri: item.image_uri }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.photoEmpty, { backgroundColor: PLACEHOLDERS[item.id % PLACEHOLDERS.length] }]}>
            <Ionicons name="restaurant" size={48} color={Palette.ink} />
          </View>
        )}
        <RoundBadge
          top={String(item.servings)}
          bottom={servingsWord(item.servings)}
          color={BADGES[item.id % BADGES.length]}
          style={styles.badge}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardText}>
          <AppText variant="heading" numberOfLines={2}>
            {item.title}
          </AppText>
          <AppText variant="label" color={Palette.inkMuted}>
            {ingredientsLabel(item.ingredient_count)}
          </AppText>
          {!!item.tags && (
            <View style={styles.cardTags}>
              {parseTags(item.tags).map((tag) => (
                <TagChip key={tag.id} tag={tag} small />
              ))}
            </View>
          )}
        </View>
        <IconButton
          icon="arrow-forward"
          size={40}
          onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: String(item.id) } })}
          accessibilityLabel={`Otwórz ${item.title}`}
        />
      </View>
    </Pressable>
  );
}

export default function RecipesScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);

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
        data={recipes}
        keyExtractor={(r) => String(r.id)}
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
        renderItem={({ item }) => <RecipeCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.sage },
  list: { paddingBottom: Spacing.eight, gap: Spacing.five },
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
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  card: {
    marginHorizontal: Spacing.five,
    backgroundColor: Palette.cream,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  photo: { width: '100%', aspectRatio: 16 / 10, borderRadius: Radius.card - 6 },
  photoEmpty: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 10, left: 10 },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.one },
  cardText: { flex: 1, gap: 4 },
});
