import type { SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { AppIcon, Page, Palette } from '@/components/dashboard-ui';
import { useAppSectionState } from '@/data/app-data';
import { formatPercentChange, formatVndAmount, sumVndAmounts } from '@/utils/money';

const chartDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function HomeScreen() {
  const { data: dashboard, isFromApi } = useAppSectionState('dashboard');
  const dailyExpenses = dashboard.dailyExpenses.slice(0, chartDays.length);
  const maxDailyExpense = dailyExpenses.reduce((max, amount) => Math.max(max, amount), 1);
  const weeklyExpense = sumVndAmounts(dailyExpenses);

  return (
    <Page>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>MEOCON  ·  QUẢN LÝ CHI TIÊU</Text>
          <Text style={styles.greeting}>Xin chào, bạn 👋</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
          <View style={styles.onlineDot} />
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Tổng chi tháng này</Text>
            <Text style={styles.heroAmount}>{formatVndAmount(dashboard.monthlyExpense)}</Text>
          </View>
          <View style={styles.heroIcon}>
            <AppIcon name={{ ios: 'arrow.up.right', android: 'north_east', web: 'north_east' }} glyph="↗" tintColor="#FFFFFF" size={19} />
          </View>
        </View>
        <View style={styles.heroBottom}>
          <View style={styles.changePill}>
            <Text style={styles.changeText}>{formatPercentChange(dashboard.monthChangeBasisPoints)}</Text>
          </View>
          <Text style={styles.heroFootnote}>so với tháng trước</Text>
          <View style={styles.sparkline}>
            {[18, 30, 22, 38, 27, 44, 33, 52, 40, 61].map((height, index) => (
              <View
                key={index}
                style={[styles.sparkBar, { height, opacity: 0.38 + index * 0.06 }]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E8F1FC' }]}>
            <AppIcon name={{ ios: 'doc.text', android: 'description', web: 'description' }} glyph="▤" tintColor={Palette.blue} size={17} />
          </View>
          <Text style={styles.statValue}>{String(dashboard.requestsSubmitted).padStart(2, '0')}</Text>
          <Text style={styles.statLabel}>Đơn đã gửi</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DDF5ED' }]}>
            <AppIcon name={{ ios: 'checkmark', android: 'check', web: 'check' }} glyph="✓" tintColor={Palette.green} size={17} />
          </View>
          <Text style={styles.statValue}>{String(dashboard.requestsApproved).padStart(2, '0')}</Text>
          <Text style={styles.statLabel}>Đã duyệt</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF1E8' }]}>
            <AppIcon name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} glyph="◷" tintColor="#E18B50" size={17} />
          </View>
          <Text style={styles.statValue}>{String(dashboard.requestsPending).padStart(2, '0')}</Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Nhịp chi tiêu</Text>
          <Text style={styles.sectionSubtitle}>
            Biểu đồ lượn sóng · {isFromApi ? 'dữ liệu API' : 'dữ liệu minh họa'}
          </Text>
        </View>
        <View style={styles.waveBadge}>
          <View style={styles.waveBadgeDot} />
          <Text style={styles.waveBadgeText}>TUẦN NÀY</Text>
        </View>
      </View>
      <WaveChart
        values={dailyExpenses}
        isFromApi={isFromApi}
        weeklyExpense={weeklyExpense}
        changeBasisPoints={dashboard.weekChangeBasisPoints}
      />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Tổng quan chi tiêu</Text>
          <Text style={styles.sectionSubtitle}>Hoạt động trong tuần này</Text>
        </View>
        <View style={styles.filterPill}><Text style={styles.filterText}>7 ngày⌄</Text></View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartSummary}>
          <Text style={styles.chartTotal}>{formatVndAmount(weeklyExpense)}</Text>
          <Text style={styles.chartCaption}>Tổng chi tuần này</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Chi tiêu</Text>
          </View>
        </View>
        <View style={styles.chart}>
          {chartDays.map((day, index) => (
            <View key={day} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${Math.round((dailyExpenses[index] ?? 0) / maxDailyExpense * 100)}%` }, index === 5 && styles.highlightedBar]} />
              </View>
              <Text style={[styles.dayLabel, index === 5 && styles.selectedDay]}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Khoản gần đây</Text>
          <Text style={styles.sectionSubtitle}>Những mục cần bạn theo dõi</Text>
        </View>
        <Text style={styles.linkText}>Xem tất cả</Text>
      </View>

      <View style={styles.recentCard}>
        {dashboard.recentExpenses.map((expense, index) => (
          <View key={`${expense.title}-${index}`}>
            {index > 0 && <View style={styles.divider} />}
            <RecentRow
              icon={{
                ios: expense.icon === 'coffee' ? 'cup.and.saucer.fill' : 'car.fill',
                android: expense.icon,
                web: expense.icon,
              }}
              fallback={expense.icon === 'coffee' ? '☕' : '↗'}
              title={expense.title}
              time={expense.date}
              amount={formatVndAmount(expense.amount)}
              color={expense.color}
              tint={expense.tint}
            />
          </View>
        ))}
      </View>

      <Text style={styles.note}>
        {isFromApi
          ? 'Đã nhận dữ liệu API · Các thao tác ghi chưa kết nối máy chủ'
          : 'Dữ liệu minh họa · Giao diện chưa kết nối cơ sở dữ liệu'}
      </Text>
    </Page>
  );
}

const waveDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function WaveChart({
  values,
  isFromApi,
  weeklyExpense,
  changeBasisPoints,
}: {
  values: number[];
  isFromApi: boolean;
  weeklyExpense: bigint;
  changeBasisPoints: number;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const maxValue = values.reduce((max, value) => Math.max(max, value), 1);
  const points = values.map((value, index) => ({
    x: (index / Math.max(values.length - 1, 1)) * size.width,
    y: size.height - (value / maxValue) * size.height,
  }));

  function measure(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) =>
      current.width === width && current.height === height ? current : { width, height },
    );
  }

  return (
    <View style={styles.waveCard}>
      <View style={styles.waveSummary}>
        <View>
          <Text style={styles.waveTotal}>{formatVndAmount(weeklyExpense)}</Text>
          <Text style={styles.chartCaption}>Tổng chi trong tuần</Text>
        </View>
        <View style={styles.waveChange}>
          <Text style={styles.waveChangeText}>{formatPercentChange(changeBasisPoints)}</Text>
        </View>
      </View>
      <View
        onLayout={measure}
        accessibilityRole="image"
        accessibilityLabel={`Biểu đồ đường lượn sóng về chi tiêu trong tuần, ${
          isFromApi ? 'dữ liệu từ API' : 'dữ liệu minh họa'
        }`}
        style={styles.wavePlot}>
        {[0, 1, 2, 3].map((line) => (
          <View key={line} style={[styles.waveGridLine, { top: `${line * 33.33}%` }]} />
        ))}
        {points.slice(0, -1).map((point, index) => {
          const nextPoint = points[index + 1];
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const length = Math.hypot(dx, dy);
          const angle = `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`;
          return (
            <View
              key={index}
              style={[
                styles.waveSegment,
                {
                  left: (point.x + nextPoint.x - length) / 2,
                  top: (point.y + nextPoint.y) / 2 - 1.5,
                  width: length,
                  transform: [{ rotate: angle }],
                },
              ]}
            />
          );
        })}
        {points.map((point, index) => (
          <View
            key={`point-${index}`}
            style={[
              styles.wavePoint,
              index === values.length - 1 && styles.wavePointActive,
              { left: point.x - 3.5, top: point.y - 3.5 },
            ]}
          />
        ))}
      </View>
      <View style={styles.waveDayLabels}>
        {waveDays.map((day) => <Text key={day} style={styles.waveDay}>{day}</Text>)}
      </View>
      <View style={styles.waveLegend}>
        <View style={styles.waveLegendDot} />
        <Text style={styles.waveLegendText}>Chi tiêu mỗi ngày</Text>
        <Text style={styles.waveFootnote}>{isFromApi ? 'Dữ liệu API' : 'Số liệu mẫu'}</Text>
      </View>
    </View>
  );
}

function RecentRow({
  icon,
  fallback,
  title,
  time,
  amount,
  color,
  tint,
}: {
  icon: SymbolViewProps['name'];
  fallback: string;
  title: string;
  time: string;
  amount: string;
  color: string;
  tint: string;
}) {
  return (
    <View style={styles.recentRow}>
      <View style={[styles.recentIcon, { backgroundColor: color }]}>
        <AppIcon name={icon} glyph={fallback} tintColor={tint} size={18} />
      </View>
      <View style={styles.recentDetails}>
        <Text style={styles.recentTitle}>{title}</Text>
        <Text style={styles.recentTime}>{time}</Text>
      </View>
      <Text style={styles.recentAmount}>−{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: Palette.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 7 },
  greeting: { color: Palette.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E3EFFD', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Palette.blue, fontSize: 17, fontWeight: '800' },
  onlineDot: { position: 'absolute', right: -1, bottom: -1, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Palette.background, backgroundColor: '#49C49A' },
  heroCard: { padding: 20, borderRadius: 20, backgroundColor: Palette.blue, overflow: 'hidden', shadowColor: Palette.blue, shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 5 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  heroAmount: { color: '#FFFFFF', fontSize: 29, fontWeight: '800', letterSpacing: -1 },
  currency: { fontSize: 18, fontWeight: '700' },
  heroIcon: { width: 39, height: 39, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 19 },
  changePill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(188,255,228,0.2)' },
  changeText: { color: '#C8FFE8', fontSize: 11, fontWeight: '800' },
  heroFootnote: { color: 'rgba(255,255,255,0.72)', fontSize: 10, marginLeft: 8 },
  sparkline: { height: 38, marginLeft: 'auto', flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  sparkBar: { width: 4, borderRadius: 4, backgroundColor: '#FFFFFF' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: { flex: 1, minHeight: 120, padding: 13, borderRadius: 16, backgroundColor: Palette.surface, borderWidth: 1, borderColor: '#EAF0F7' },
  statIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  statValue: { color: Palette.ink, fontSize: 21, fontWeight: '800' },
  statLabel: { color: Palette.muted, fontSize: 10, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 13 },
  sectionTitle: { color: Palette.ink, fontSize: 16, fontWeight: '800' },
  sectionSubtitle: { color: Palette.muted, fontSize: 11, marginTop: 4 },
  filterPill: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFFFFF' },
  filterText: { color: '#676C83', fontSize: 10, fontWeight: '700' },
  chartCard: { padding: 17, borderRadius: 23, backgroundColor: Palette.surface, borderWidth: 1, borderColor: '#F0F0F5' },
  chartSummary: { position: 'relative' },
  chartTotal: { color: Palette.ink, fontSize: 22, fontWeight: '800' },
  chartCurrency: { color: Palette.muted, fontSize: 12 },
  chartCaption: { color: Palette.muted, fontSize: 10, marginTop: 3 },
  chartLegend: { position: 'absolute', right: 0, top: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Palette.blue },
  legendText: { color: Palette.muted, fontSize: 10 },
  chart: { height: 128, marginTop: 14, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', gap: 8 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 7, backgroundColor: '#F0F5FC' },
  bar: { width: '100%', borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: '#BCD4F3' },
  highlightedBar: { backgroundColor: Palette.blue },
  dayLabel: { color: '#A1A4B4', fontSize: 9, marginTop: 7 },
  selectedDay: { color: Palette.blue, fontWeight: '800' },
  linkText: { color: Palette.blue, fontSize: 11, fontWeight: '700' },
  waveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: Palette.blueSoft },
  waveBadgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Palette.blue },
  waveBadgeText: { color: Palette.blueDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  waveCard: { padding: 16, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: '#EAF0F7' },
  waveSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waveTotal: { color: Palette.ink, fontSize: 20, fontWeight: '800' },
  waveChange: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: '#EAF6F0' },
  waveChangeText: { color: '#328566', fontSize: 10, fontWeight: '800' },
  wavePlot: { height: 132, position: 'relative', marginTop: 16, marginHorizontal: 4, overflow: 'hidden' },
  waveGridLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#EAF0F7' },
  waveSegment: { position: 'absolute', height: 3, borderRadius: 2, backgroundColor: Palette.blue },
  wavePoint: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFFFFF', borderColor: Palette.blue, borderWidth: 1.5 },
  wavePointActive: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, backgroundColor: '#FFFFFF' },
  waveDayLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 1 },
  waveDay: { color: Palette.muted, fontSize: 9 },
  waveLegend: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Palette.line },
  waveLegendDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Palette.blue, marginRight: 6 },
  waveLegendText: { color: Palette.muted, fontSize: 9 },
  waveFootnote: { color: '#A0ACBA', fontSize: 8, marginLeft: 'auto' },
  recentCard: { paddingHorizontal: 14, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: '#EAF0F7' },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  recentIcon: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  recentDetails: { flex: 1, marginLeft: 11 },
  recentTitle: { color: Palette.ink, fontSize: 12, fontWeight: '700' },
  recentTime: { color: Palette.muted, fontSize: 9, marginTop: 4 },
  recentAmount: { color: Palette.ink, fontSize: 11, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.line },
  note: { color: '#A5A8B6', textAlign: 'center', fontSize: 9, marginTop: 18 },
});
