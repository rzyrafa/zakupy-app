import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/text';
import { Palette } from '@/constants/theme';

const PHRASES = ['GOTUJ', 'KUPUJ', 'JEDZ', 'POWTÓRZ'];
const SPEED = 40; // px na sekundę

function Segment() {
  return (
    <View style={styles.segment}>
      {PHRASES.map((p) => (
        <View key={p} style={styles.item}>
          <AppText variant="bold" color={Palette.cream}>
            {p}
          </AppText>
          <Ionicons name="leaf" size={16} color={Palette.terracotta} />
        </View>
      ))}
    </View>
  );
}

/** Czarny pasek z tekstem przewijanym w nieskończoność od prawej do lewej. */
export function Marquee() {
  const [offset] = useState(() => new Animated.Value(0));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!width) return;
    offset.setValue(0);
    const loop = Animated.loop(
      Animated.timing(offset, {
        toValue: -width,
        duration: (width / SPEED) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [offset, width]);

  return (
    <View style={styles.band}>
      <Animated.View style={[styles.track, { transform: [{ translateX: offset }] }]}>
        {/* trzy kopie: przesuwamy o szerokość jednej, więc pętla jest bez szwu */}
        <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <Segment />
        </View>
        <Segment />
        <Segment />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { height: 44, backgroundColor: Palette.ink, overflow: 'hidden', justifyContent: 'center' },
  track: { flexDirection: 'row' },
  segment: { flexDirection: 'row' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingRight: 14 },
});
