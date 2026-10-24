import { StyleSheet, Text } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

/** Napis-logo pismem odręcznym. Tylko tutaj używamy fontu script. */
export function Logo({ size = 56, color = Palette.cream }: { size?: number; color?: string }) {
  return <Text style={[styles.logo, { fontSize: size, lineHeight: size * 1.5, color }]}>przepisy</Text>;
}

const styles = StyleSheet.create({
  logo: { fontFamily: Fonts.script, includeFontPadding: false },
});
