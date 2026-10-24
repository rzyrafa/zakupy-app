import { Fonts, Palette } from '@/constants/theme';

/** Nagłówek ekranu w kolorze pasa danego ekranu, bez cienia, tytuł w mono bold. */
export function bandHeader(color: string) {
  return {
    headerStyle: { backgroundColor: color },
    headerShadowVisible: false,
    headerTintColor: Palette.ink,
    headerTitleStyle: { fontFamily: Fonts.monoBold, fontSize: 18 },
  };
}
