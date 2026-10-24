import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

export type TextVariant = 'body' | 'bold' | 'small' | 'label' | 'heading' | 'display';

type Props = TextProps & { variant?: TextVariant; color?: string };

/** Każdy tekst w aplikacji idzie przez ten komponent — wszędzie font monospace. */
export function AppText({ variant = 'body', color = Palette.ink, style, ...rest }: Props) {
  return <Text {...rest} style={[styles.base, styles[variant], { color }, style]} />;
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
  body: { fontFamily: Fonts.mono, fontSize: 16, lineHeight: 22 },
  bold: { fontFamily: Fonts.monoBold, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: Fonts.mono, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: Fonts.monoBold, fontSize: 13, lineHeight: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
  heading: { fontFamily: Fonts.monoBold, fontSize: 22, lineHeight: 28 },
  display: { fontFamily: Fonts.monoBold, fontSize: 32, lineHeight: 38 },
});
