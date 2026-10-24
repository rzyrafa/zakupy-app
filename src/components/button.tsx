import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { AppText } from '@/components/text';
import { Border, Palette, Radius } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Variant = 'primary' | 'outline' | 'danger' | 'moss';

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: Palette.ink, fg: Palette.cream, border: Palette.ink },
  outline: { bg: 'transparent', fg: Palette.ink, border: Palette.ink },
  danger: { bg: Palette.terracotta, fg: Palette.cream, border: Palette.ink },
  moss: { bg: Palette.cream, fg: Palette.ink, border: Palette.moss },
};

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
};

/** Przycisk-pigułka z etykietą uppercase. */
export function Button({ title, onPress, variant = 'primary', icon, disabled, style }: Props) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={18} color={v.fg} />}
      <AppText variant="label" color={v.fg} style={styles.label}>
        {title}
      </AppText>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  iconColor?: string;
  size?: number;
};

/** Okrągły przycisk z samą ikoną (dodaj, zamknij, ustawienia…). */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = Palette.ink,
  iconColor = Palette.cream,
  size = 44,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.icon,
        { width: size, height: size, backgroundColor: color, opacity: pressed ? 0.75 : 1 },
      ]}>
      <Ionicons name={icon} size={size * 0.5} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 20,
    borderWidth: Border,
    borderRadius: Radius.pill,
  },
  label: { fontSize: 15 },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: Border,
    borderColor: Palette.ink,
  },
});
