import { StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/text';
import { Palette } from '@/constants/theme';

type Props = {
  top: string;
  bottom?: string;
  color?: string;
  textColor?: string;
  size?: number;
  style?: ViewStyle;
};

/** Okrągła plakietka jak etykieta pochodzenia na torebce kawy, np. „2 / PORCJE”. */
export function RoundBadge({
  top,
  bottom,
  color = Palette.terracotta,
  textColor = Palette.cream,
  size = 72,
  style,
}: Props) {
  return (
    <View style={[styles.badge, { width: size, height: size, backgroundColor: color }, style]}>
      <AppText variant="heading" color={textColor} style={styles.top}>
        {top}
      </AppText>
      {bottom && (
        <AppText variant="label" color={textColor} style={styles.bottom}>
          {bottom}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  top: { fontSize: 22, lineHeight: 24 },
  bottom: { fontSize: 10, lineHeight: 12 },
});
