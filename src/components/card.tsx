import { StyleSheet, View, type ViewProps } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

type Props = ViewProps & { color?: string; bordered?: boolean };

/** Płaska karta: kolorowe wypełnienie, gruba czarna ramka, radius 20, bez cienia. */
export function Card({ color = Palette.cream, bordered = true, style, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[styles.card, { backgroundColor: color, borderWidth: bordered ? Border : 0 }, style]}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderColor: Palette.ink, borderRadius: Radius.card, padding: Spacing.five, gap: Spacing.three },
});
