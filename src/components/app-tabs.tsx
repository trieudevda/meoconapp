import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import type { SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/dashboard-ui';

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} detachInactiveScreens />
      <TabList style={StyleSheet.flatten([styles.bar, { bottom: Math.max(insets.bottom, 10) }])}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton icon={{ ios: 'house.fill', android: 'home', web: 'home' }} label="Tổng quan" />
        </TabTrigger>
        <TabTrigger name="requests" href="/requests" asChild>
          <TabButton icon={{ ios: 'doc.text.fill', android: 'description', web: 'description' }} label="Đơn duyệt" />
        </TabTrigger>
        <TabTrigger name="transactions" href="/transactions" asChild>
          <TabButton icon={{ ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' }} label="Thu chi" />
        </TabTrigger>
        <TabTrigger name="settings" href="/settings" asChild>
          <TabButton icon={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }} label="Cài đặt" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  icon,
  label,
  isFocused,
  onPress,
  onLongPress,
  ref: _ref,
  href: _href,
  ...pressableProps
}: TabTriggerSlotProps & { icon: SymbolViewProps['name']; label: string }) {
  return (
    <Pressable
      {...pressableProps}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) =>
        StyleSheet.flatten([styles.tab, isFocused && styles.activeTab, pressed && styles.pressed])
      }>
      <AppIcon
        name={icon}
        glyph={
          label === 'Tổng quan' ? '⌂' : label === 'Đơn duyệt' ? '▤' : label === 'Thu chi' ? '↔' : '☷'
        }
        tintColor={isFocused ? '#FFFFFF' : '#7D8297'}
        size={19}
      />
      <Text style={[styles.tabLabel, isFocused && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F7FC' },
  slot: { flex: 1 },
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    width: '94%',
    maxWidth: 460,
    alignItems: 'center',
    minHeight: 66,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#363A53',
    shadowOpacity: 0.11,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  tab: {
    minWidth: 0,
    flex: 1,
    height: 52,
    gap: 3,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#3478D4',
    shadowColor: '#3478D4',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tabLabel: { color: '#74849A', fontSize: 9, fontWeight: '600' },
  activeLabel: { color: '#FFFFFF' },
  pressed: { opacity: 0.78 },
});
