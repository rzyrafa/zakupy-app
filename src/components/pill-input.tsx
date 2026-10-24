import { ReactNode, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View, ViewStyle } from 'react-native';

import { Border, Fonts, Palette, Radius } from '@/constants/theme';

type Props = TextInputProps & { containerStyle?: ViewStyle; right?: ReactNode };

/** Pole tekstowe w kształcie pigułki; przy fokusie ramka w kolorze lawendy. */
export function PillInput({ containerStyle, right, multiline, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.container,
        multiline && styles.multiline,
        { borderColor: focused ? Palette.lavender : Palette.ink },
        containerStyle,
      ]}>
      <TextInput
        {...rest}
        multiline={multiline}
        placeholderTextColor={Palette.inkMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, multiline && styles.inputMultiline, style]}
      />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cream,
    borderWidth: Border,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 8,
  },
  multiline: { borderRadius: Radius.card, alignItems: 'flex-start', paddingVertical: 12 },
  input: { flex: 1, fontFamily: Fonts.mono, fontSize: 16, color: Palette.ink, paddingVertical: 10 },
  inputMultiline: { minHeight: 150, textAlignVertical: 'top', paddingVertical: 0, lineHeight: 24 },
});
