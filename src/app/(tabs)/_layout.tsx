import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/button';
import { bandHeader } from '@/constants/navigation';
import { Border, Fonts, Palette, Radius } from '@/constants/theme';

function TabIcon({ name, focused }: { name: ComponentProps<typeof Ionicons>['name']; focused: boolean }) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Ionicons name={name} size={20} color={focused ? Palette.cream : Palette.ink} />
    </View>
  );
}

function SettingsButton() {
  return (
    <View style={styles.settings}>
      <IconButton icon="settings-sharp" size={38} onPress={() => router.push('/settings')} accessibilityLabel="Ustawienia" />
    </View>
  );
}

export default function TabLayout() {
  // pasek zakładek sam doliczy dolny margines tylko bez własnej wysokości — tu ustawiamy ją ręcznie
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        ...bandHeader(Palette.cream),
        headerRight: () => <SettingsButton />,
        tabBarStyle: [styles.tabBar, { height: 64 + insets.bottom, paddingBottom: insets.bottom + 6 }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: Palette.ink,
        tabBarInactiveTintColor: Palette.ink,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Przepisy',
          tabBarLabel: 'PRZEPISY',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="book" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          ...bandHeader(Palette.sky),
          title: 'Lista zakupów',
          tabBarLabel: 'ZAKUPY',
          tabBarIcon: ({ focused }) => <TabIcon name="cart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          ...bandHeader(Palette.sunshine),
          title: 'Nowy przepis',
          tabBarLabel: 'NOWY',
          tabBarIcon: ({ focused }) => <TabIcon name="add-circle" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Palette.cream,
    borderTopWidth: Border,
    borderTopColor: Palette.ink,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: { paddingTop: 6 },
  tabLabel: { fontFamily: Fonts.monoBold, fontSize: 11, marginTop: 2 },
  iconPill: { width: 52, height: 28, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconPillActive: { backgroundColor: Palette.ink },
  settings: { marginRight: 16 },
});
