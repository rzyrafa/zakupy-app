import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { AppText } from '@/components/text';
import { Border, Palette, Radius } from '@/constants/theme';
import { UNITS } from '@/lib/units';

type Props = {
  value: string;
  onChange: (unit: string) => void;
};

/** Pigułka z aktualną jednostką; po kliknięciu karta z jednostkami do wyboru. */
export function UnitPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <AppText variant={value ? 'bold' : 'body'} color={value ? Palette.ink : Palette.inkMuted} numberOfLines={1}>
          {value || 'JEDN.'}
        </AppText>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Card style={styles.sheet}>
            <AppText variant="heading">Jednostka</AppText>
            <ScrollView contentContainerStyle={styles.options}>
              {UNITS.map((unit) => {
                const selected = unit === value;
                return (
                  <Pressable
                    key={unit || 'none'}
                    onPress={() => {
                      onChange(unit);
                      setOpen(false);
                    }}
                    style={[styles.option, selected && styles.optionSelected]}>
                    <AppText variant="bold" color={selected ? Palette.cream : Palette.ink}>
                      {unit || '— brak —'}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 84,
    minHeight: 48,
    paddingHorizontal: 8,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  sheet: { maxHeight: '75%' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: Border,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
  },
  optionSelected: { backgroundColor: Palette.ink },
});
