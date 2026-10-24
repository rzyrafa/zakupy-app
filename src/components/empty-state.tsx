import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/text';
import { Border, Palette } from '@/constants/theme';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  children?: ReactNode;
};

export function EmptyState({ icon, title, message, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={44} color={Palette.ink} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {title}
      </AppText>
      {message && <AppText style={styles.center}>{message}</AppText>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16, marginTop: 24 },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: Border,
    borderColor: Palette.ink,
    backgroundColor: Palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});
