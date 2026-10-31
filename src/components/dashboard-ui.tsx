import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import Animated, { FadeIn } from 'react-native-reanimated';

export const Palette = {
  background: '#F3F7FC',
  surface: '#FFFFFF',
  ink: '#1E2B3E',
  muted: '#74849A',
  line: '#E5ECF4',
  blue: '#3478D4',
  blueDark: '#245EAD',
  blueSoft: '#E8F1FC',
  mint: '#DDF5ED',
  green: '#258B6B',
  coral: '#FF8D78',
  yellow: '#F6C86D',
};

const pageEntry = FadeIn.duration(180);

export function AppIcon({
  name,
  glyph,
  tintColor,
  size = 18,
}: {
  name: SymbolViewProps['name'];
  glyph: string;
  tintColor: string;
  size?: number;
}) {
  if (Platform.OS === 'web') {
    return (
      <Text
        aria-hidden
        style={{
          color: tintColor,
          fontSize: size,
          fontWeight: '700',
          lineHeight: size + 3,
          textAlign: 'center',
        }}>
        {glyph}
      </Text>
    );
  }

  return <SymbolView name={name} size={size} tintColor={tintColor} />;
}

export function Page({ children }: PropsWithChildren) {
  return (
    <Animated.View entering={pageEntry} style={styles.page}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View pointerEvents="none" style={styles.glow} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safeArea: { flex: 1, overflow: 'hidden', backgroundColor: Palette.background },
  glow: {
    position: 'absolute',
    top: -110,
    right: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#E4EFFC',
    opacity: 0.72,
  },
  scroll: { flex: 1 },
  scrollContent: { alignItems: 'center', flexGrow: 1 },
  content: {
    width: '100%',
    maxWidth: 560,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 130,
  },
});
