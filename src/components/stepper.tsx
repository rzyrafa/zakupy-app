import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/text';
import { Border, Palette, Radius } from '@/constants/theme';

type Props = { value: number; onChange: (value: number) => void; min?: number; suffix?: string };

/** Pigułka „− N +” jak licznik „ADD” z inspiracji. */
export function Stepper({ value, onChange, min = 1, suffix }: Props) {
  return (
    <View style={styles.pill}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        hitSlop={6}
        style={styles.side}
        accessibilityLabel="Zmniejsz">
        <Ionicons name="remove" size={20} color={Palette.ink} />
      </Pressable>
      <View style={styles.divider} />
      <AppText variant="bold" style={styles.value}>
        {suffix ? `${value} ${suffix}` : value}
      </AppText>
      <View style={styles.divider} />
      <Pressable onPress={() => onChange(value + 1)} hitSlop={6} style={styles.side} accessibilityLabel="Zwiększ">
        <Ionicons name="add" size={20} color={Palette.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 44,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.cream,
  },
  side: { width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1.5, height: '60%', backgroundColor: Palette.ink },
  value: { paddingHorizontal: 14, textTransform: 'uppercase' },
});
