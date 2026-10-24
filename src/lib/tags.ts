import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { Palette } from '@/constants/theme';

export type Tag = {
  id: string;
  label: string;
  color: string;
  textColor: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

/** Stała lista etykiet przepisów. Id trafia do bazy, więc nie zmieniamy istniejących id. */
export const TAGS: Tag[] = [
  { id: 'sniadanie', label: 'Śniadanie', color: Palette.sunshine, textColor: Palette.ink, icon: 'sunny' },
  { id: 'obiad', label: 'Obiad', color: Palette.terracotta, textColor: Palette.cream, icon: 'restaurant' },
  { id: 'kolacja', label: 'Kolacja', color: Palette.lavender, textColor: Palette.ink, icon: 'moon' },
  { id: 'zupa', label: 'Zupa', color: Palette.sky, textColor: Palette.ink, icon: 'water' },
  { id: 'deser', label: 'Deser', color: Palette.pink, textColor: Palette.ink, icon: 'ice-cream' },
  { id: 'przekaska', label: 'Przekąska', color: Palette.sage, textColor: Palette.cream, icon: 'pizza' },
  { id: 'wege', label: 'Wege', color: Palette.moss, textColor: Palette.cream, icon: 'leaf' },
];

const BY_ID = new Map(TAGS.map((t) => [t.id, t]));

/** "sniadanie,wege" -> [Tag, Tag] (w kolejności z TAGS, nieznane id pomijane) */
export function parseTags(value: string): Tag[] {
  const ids = new Set(value.split(',').filter(Boolean));
  return TAGS.filter((t) => ids.has(t.id));
}

export function serializeTags(ids: string[]): string {
  return TAGS.filter((t) => ids.includes(t.id))
    .map((t) => t.id)
    .join(',');
}

export function getTag(id: string): Tag | undefined {
  return BY_ID.get(id);
}
