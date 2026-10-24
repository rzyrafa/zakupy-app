import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/text';
import { Border, Palette, Radius } from '@/constants/theme';
import type { Tag } from '@/lib/tags';

type Props = {
  tag: Tag;
  /** Bez onPress chip jest tylko etykietą (zawsze w kolorze etykiety). */
  onPress?: () => void;
  selected?: boolean;
  small?: boolean;
};

/** Pigułka etykiety: kolor etykiety, gdy wybrana; biała z czarną ramką, gdy nie. */
export function TagChip({ tag, onPress, selected = true, small }: Props) {
  const filled = selected || !onPress;
  const bg = filled ? tag.color : Palette.cream;
  const fg = filled ? tag.textColor : Palette.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        small && styles.small,
        { backgroundColor: bg, opacity: pressed ? 0.75 : 1 },
      ]}>
      <Ionicons name={tag.icon} size={small ? 12 : 16} color={fg} />
      <AppText variant="label" color={fg} style={small ? styles.smallLabel : undefined}>
        {tag.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
  },
  small: { paddingHorizontal: 10, paddingVertical: 4, gap: 4, borderWidth: 1.5 },
  smallLabel: { fontSize: 11, lineHeight: 14 },
});
