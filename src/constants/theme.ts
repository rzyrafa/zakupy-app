/**
 * Styl inspirowany „Touchy Coffee”: pełne kolorowe pasy, grube czarne ramki,
 * font monospace wszędzie, pigułki (radius 100), karty (radius 20), zero cieni.
 * Aplikacja jest zawsze jasna — jedna paleta.
 */
export const Palette = {
  ink: '#000000',
  inkMuted: 'rgba(0,0,0,0.6)',
  cream: '#ffffff',
  terracotta: '#9f4920',
  sage: '#788c8c',
  sky: '#d0eaf4',
  sunshine: '#fff78f',
  lavender: '#a697c6',
  moss: '#5b9133',
  pink: '#f5b5c8',
} as const;

export const Fonts = {
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
  script: 'Pacifico_400Regular',
} as const;

export const Radius = { pill: 100, card: 20 } as const;

/** Grubość czarnych ramek. */
export const Border = 2;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
} as const;
