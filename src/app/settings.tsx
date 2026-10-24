import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { PillInput } from '@/components/pill-input';
import { AppText } from '@/components/text';
import { Palette, Spacing } from '@/constants/theme';
import { deleteDeepSeekKey, getDeepSeekKey, setDeepSeekKey } from '@/lib/settings';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getDeepSeekKey().then((key) => {
      setApiKey(key ?? '');
      setHasKey(!!key);
    });
  }, []);

  const save = async () => {
    if (!apiKey.trim()) return;
    await setDeepSeekKey(apiKey.trim());
    setHasKey(true);
    Alert.alert('Zapisano', 'Klucz API został zapisany na tym urządzeniu.');
  };

  const remove = async () => {
    await deleteDeepSeekKey();
    setApiKey('');
    setHasKey(false);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card>
        <AppText variant="heading">DeepSeek AI</AppText>
        <AppText>
          Funkcja AI w przygotowaniu: na podstawie składników przepisu wygeneruje opis przygotowania. Klucz jest
          przechowywany w bezpiecznym magazynie telefonu.
        </AppText>

        <AppText variant="label" style={styles.label}>
          Klucz API
        </AppText>
        <PillInput
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="SK-…"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          right={
            <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} accessibilityLabel="Pokaż klucz">
              <Ionicons name={visible ? 'eye-off' : 'eye'} size={22} color={Palette.ink} />
            </Pressable>
          }
        />
        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: hasKey ? Palette.moss : Palette.inkMuted }]} />
          <AppText variant="label">{hasKey ? 'Klucz zapisany' : 'Brak zapisanego klucza'}</AppText>
        </View>

        <View style={styles.row}>
          <Button title="Zapisz" icon="save" onPress={save} disabled={!apiKey.trim()} style={styles.flex} />
          <Button title="Usuń" icon="trash" variant="outline" onPress={remove} disabled={!hasKey} style={styles.flex} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Palette.lavender },
  container: { padding: Spacing.five, flexGrow: 1 },
  label: { marginTop: Spacing.two },
  status: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 12, height: 12, borderRadius: 999 },
  row: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  flex: { flex: 1 },
});
