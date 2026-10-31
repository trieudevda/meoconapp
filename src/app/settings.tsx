import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon, Page, Palette } from '@/components/dashboard-ui';
import { useAppDataStore, useAppSection } from '@/data/app-data';

const futureSettings = [
  {
    icon: 'bell.badge',
    androidIcon: 'notifications',
    title: 'Thông báo',
    subtitle: 'Nhắc nhở và cập nhật trạng thái đơn',
    glyph: '♧',
    color: '#FFF0E8',
    tint: '#DE8A57',
  },
  {
    icon: 'globe',
    androidIcon: 'language',
    title: 'Ngôn ngữ & tiền tệ',
    subtitle: 'Tiếng Việt · Việt Nam đồng',
    glyph: '◎',
    color: '#E8F5EF',
    tint: '#399A76',
  },
  {
    icon: 'lock.shield',
    androidIcon: 'security',
    title: 'Quyền riêng tư',
    subtitle: 'Quản lý dữ liệu và bảo mật',
    glyph: '◈',
    color: '#E8F1FC',
    tint: Palette.blue,
  },
] as const;

export default function SettingsScreen() {
  const settings = useAppSection('settings');
  const { setApiData } = useAppDataStore();
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);

  function toggleNotifications() {
    setApiData((current) => ({
      ...current,
      settings: {
        ...(current.settings ?? settings),
        notificationsEnabled: !settings.notificationsEnabled,
      },
    }));
  }

  return (
    <Page>
      <View style={styles.topLine}>
        <View style={styles.mark}>
          <AppIcon name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }} glyph="☷" tintColor={Palette.blue} />
        </View>
        <Text style={styles.eyebrow}>KHÔNG GIAN CỦA BẠN</Text>
      </View>
      <Text style={styles.title}>Cài đặt</Text>
      <Text style={styles.subtitle}>Mọi tùy chỉnh của bạn sẽ ở đây.</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}><Text style={styles.avatarLetter}>M</Text></View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>Meo Con</Text>
          <Text style={styles.profileCaption}>Tài khoản cá nhân</Text>
        </View>
        <View style={styles.localBadge}>
          <View style={styles.localDot} />
          <Text style={styles.localText}>BẢN NHÁP</Text>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Tùy chọn</Text>
        <Text style={styles.comingSoon}>TRONG PHIÊN</Text>
      </View>
      <View style={styles.settingsCard}>
        {futureSettings.map((item, index) => (
          <View key={item.title}>
            <Pressable
              accessibilityRole={item.title === 'Thông báo' ? 'switch' : 'button'}
              accessibilityState={
                item.title === 'Thông báo'
                  ? { checked: settings.notificationsEnabled }
                  : undefined
              }
              accessibilityLabel={
                item.title === 'Thông báo'
                  ? `${item.title}: ${settings.notificationsEnabled ? 'đang bật' : 'đang tắt'}`
                  : item.title === 'Ngôn ngữ & tiền tệ'
                    ? 'Chọn tiền tệ, hiện tại VND'
                    : undefined
              }
              disabled={item.title === 'Quyền riêng tư'}
              onPress={
                item.title === 'Thông báo'
                  ? toggleNotifications
                  : item.title === 'Ngôn ngữ & tiền tệ'
                    ? () => setCurrencyPickerVisible(true)
                    : undefined
              }
              style={({ pressed }) => [
                styles.settingRow,
                pressed && item.title !== 'Quyền riêng tư' && styles.pressed,
              ]}>
              <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
                <AppIcon
                  name={{ ios: item.icon, android: item.androidIcon, web: item.androidIcon }}
                  glyph={item.glyph}
                  tintColor={item.tint}
                />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>
                  {item.title === 'Thông báo'
                    ? `Nhắc nhở và cập nhật trạng thái đơn · ${settings.notificationsEnabled ? 'Đang bật' : 'Đang tắt'}`
                    : item.title === 'Ngôn ngữ & tiền tệ'
                      ? 'Tiếng Việt · VND · Việt Nam đồng'
                      : item.subtitle}
                </Text>
              </View>
              {item.title === 'Thông báo' ? (
                <View
                  style={[
                    styles.toggleTrack,
                    settings.notificationsEnabled && styles.toggleTrackActive,
                  ]}>
                  <View
                    style={[
                      styles.toggleThumb,
                      settings.notificationsEnabled && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              ) : item.title === 'Ngôn ngữ & tiền tệ' ? (
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>VND</Text>
                  <AppIcon name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} glyph="⌄" tintColor={Palette.blueDark} size={12} />
                </View>
              ) : (
                <View style={styles.arrow}>
                  <AppIcon name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} glyph="›" tintColor="#A4A7B5" size={13} />
                </View>
              )}
            </Pressable>
            {index < futureSettings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <AppIcon name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} glyph="✦" tintColor={Palette.blue} />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Đang hoàn thiện</Text>
          <Text style={styles.infoBody}>
            Thông báo hiện là tùy chọn giao diện, chưa bật thông báo hệ thống. Cài đặt chỉ lưu trong phiên này; tiền tệ hiện hỗ trợ VND.
          </Text>
        </View>
      </View>

      <Text style={styles.version}>MEOCON  ·  GIAO DIỆN MINH HỌA  ·  v1.0</Text>

      <Modal
        visible={currencyPickerVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setCurrencyPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng chọn tiền tệ"
            style={StyleSheet.absoluteFill}
            onPress={() => setCurrencyPickerVisible(false)}
          />
          <View style={styles.currencySheet}>
            <Text style={styles.currencyTitle}>Loại tiền tệ</Text>
            <Text style={styles.currencySubtitle}>
              Giao diện hiện hỗ trợ Việt Nam đồng.
            </Text>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.currency === 'VND' }}
              onPress={() => {
                setApiData((current) => ({
                  ...current,
                  settings: { ...(current.settings ?? settings), currency: 'VND' },
                }));
                setCurrencyPickerVisible(false);
              }}
              style={styles.currencyOption}>
              <View>
                <Text style={styles.currencyOptionTitle}>VND</Text>
                <Text style={styles.currencyOptionSubtitle}>Đồng Việt Nam (₫)</Text>
              </View>
              <AppIcon
                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                glyph="✓"
                tintColor={Palette.blue}
                size={20}
              />
            </Pressable>
            <Text style={styles.currencyFootnote}>
              Tùy chọn này chỉ áp dụng trong phiên hiện tại.
            </Text>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  topLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  mark: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#E3EFFD', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  eyebrow: { color: Palette.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: Palette.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: Palette.muted, fontSize: 12, marginTop: 6 },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginTop: 22, padding: 15, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EEF5' },
  profileAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E3EFFD', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: Palette.blue, fontSize: 18, fontWeight: '800' },
  profileCopy: { flex: 1, marginLeft: 12 },
  profileName: { color: Palette.ink, fontSize: 14, fontWeight: '800' },
  profileCaption: { color: Palette.muted, fontSize: 10, marginTop: 4 },
  localBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: '#EAF2FC' },
  localDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Palette.blue },
  localText: { color: Palette.blueDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: Palette.ink, fontSize: 16, fontWeight: '800' },
  comingSoon: { color: '#A2A5B3', fontSize: 8, fontWeight: '800', letterSpacing: 0.9 },
  settingsCard: { paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EEF5' },
  settingRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, marginLeft: 11 },
  settingTitle: { color: Palette.ink, fontSize: 12, fontWeight: '700' },
  settingSubtitle: { color: Palette.muted, fontSize: 9, marginTop: 5 },
  arrow: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#F7F7FA', alignItems: 'center', justifyContent: 'center' },
  toggleTrack: { width: 40, height: 23, borderRadius: 12, padding: 3, justifyContent: 'center', backgroundColor: '#DCE5EF' },
  toggleTrackActive: { backgroundColor: Palette.blue },
  toggleThumb: { width: 17, height: 17, borderRadius: 9, backgroundColor: '#FFFFFF' },
  toggleThumbActive: { alignSelf: 'flex-end' },
  currencyBadge: { minWidth: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 6, borderRadius: 8, backgroundColor: Palette.blueSoft },
  currencyBadgeText: { color: Palette.blueDark, fontSize: 9, fontWeight: '800' },
  pressed: { opacity: 0.76 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.line, marginLeft: 50 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, padding: 15, borderRadius: 15, backgroundColor: '#E8F1FC' },
  infoIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  infoCopy: { flex: 1 },
  infoTitle: { color: Palette.ink, fontSize: 11, fontWeight: '800' },
  infoBody: { color: '#777A91', fontSize: 10, lineHeight: 16, marginTop: 5 },
  version: { color: '#A5A8B6', textAlign: 'center', fontSize: 8, letterSpacing: 1, marginTop: 26 },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(22,38,60,0.4)' },
  currencySheet: { width: '100%', maxWidth: 420, padding: 20, borderRadius: 18, backgroundColor: '#FFFFFF' },
  currencyTitle: { color: Palette.ink, fontSize: 18, fontWeight: '800' },
  currencySubtitle: { color: Palette.muted, fontSize: 11, marginTop: 5 },
  currencyOption: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: Palette.blue, backgroundColor: Palette.blueSoft },
  currencyOptionTitle: { color: Palette.ink, fontSize: 12, fontWeight: '800' },
  currencyOptionSubtitle: { color: Palette.muted, fontSize: 10, marginTop: 3 },
  currencyFootnote: { color: Palette.muted, fontSize: 9, marginTop: 12 },
});
