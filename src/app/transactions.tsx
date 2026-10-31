import { useState, type ComponentProps } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppIcon, Page, Palette } from '@/components/dashboard-ui';
import {
  type Transaction,
  type TransactionType,
  useAppSectionState,
  useSessionData,
} from '@/data/app-data';
import {
  formatVndAmount,
  formatVndInput,
  parseVndAmount,
  sumVndAmounts,
} from '@/utils/money';

type Filter = 'Tất cả' | TransactionType;

type TransactionForm = Omit<Transaction, 'id' | 'date' | 'amount'> & { amount: string };

const MAX_TRANSACTIONS = 50;

const emptyForm: TransactionForm = {
  name: '',
  category: '',
  note: '',
  amount: '',
  type: 'Chi',
};

export default function TransactionsScreen() {
  const { data: transactionsFromApi, isFromApi } = useAppSectionState('transactions');
  const [transactions, setTransactions] = useSessionData(transactionsFromApi, MAX_TRANSACTIONS);
  const [filter, setFilter] = useState<Filter>('Tất cả');
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [error, setError] = useState('');
  const formVisible = editingId !== null;
  const visibleTransactions =
    filter === 'Tất cả'
      ? transactions
      : transactions.filter((transaction) => transaction.type === filter);
  const income = sumVndAmounts(
    transactions.filter((transaction) => transaction.type === 'Thu').map((transaction) => transaction.amount),
  );
  const expenses = sumVndAmounts(
    transactions.filter((transaction) => transaction.type === 'Chi').map((transaction) => transaction.amount),
  );

  function openNewTransaction() {
    setForm(emptyForm);
    setEditingId(-1);
    setError('');
  }

  function openEditTransaction(transaction: Transaction) {
    setForm({
      name: transaction.name,
      category: transaction.category,
      note: transaction.note,
      amount: formatVndInput(String(transaction.amount)),
      type: transaction.type,
    });
    setEditingId(transaction.id);
    setError('');
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function saveTransaction() {
    const name = form.name.trim();
    const category = form.category.trim();
    const amount = parseVndAmount(form.amount);

    if (
      !name ||
      !category ||
      amount === null
    ) {
      setError('Nhập tên, danh mục và số tiền từ 1 đến 1.000.000.000.000 ₫.');
      return;
    }

    const nextId =
      editingId === -1
        ? transactions.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1
        : editingId ?? 0;
    const transaction: Transaction = {
      ...form,
      id: nextId,
      name,
      category,
      note: form.note.trim(),
      amount,
      date:
        editingId === -1
          ? new Date().toLocaleDateString('vi-VN')
          : transactions.find((item) => item.id === editingId)?.date ??
            new Date().toLocaleDateString('vi-VN'),
    };

    if (editingId === -1) {
      if (transactions.length >= MAX_TRANSACTIONS) {
        setError(`Đã đạt giới hạn ${MAX_TRANSACTIONS} giao dịch hiển thị.`);
        return;
      }
      setTransactions((current) => [transaction, ...current].slice(0, MAX_TRANSACTIONS));
    } else {
      setTransactions((current) =>
        current.map((item) => (item.id === editingId ? transaction : item)),
      );
    }
    closeForm();
  }

  function confirmDelete() {
    if (!deleting) return;
    setTransactions((current) => current.filter((item) => item.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <Page>
      <View style={styles.topLine}>
        <View style={styles.brandMark}>
          <AppIcon name={{ ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' }} glyph="↔" tintColor={Palette.blue} />
        </View>
        <Text style={styles.eyebrow}>SỔ THU CHI CÁ NHÂN</Text>
        <View style={styles.spacer} />
        <View style={styles.sampleBadge}>
          <Text style={styles.sampleBadgeText}>{isFromApi ? 'API' : 'MẪU'}</Text>
        </View>
      </View>
      <Text style={styles.title}>Thu chi</Text>
      <Text style={styles.subtitle}>Ghi lại dòng tiền mỗi ngày, gọn gàng và dễ xem.</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>SỐ DƯ TẠM TÍNH</Text>
        <Text style={styles.balanceValue}>{formatVndAmount(income - expenses)}</Text>
        <View style={styles.balanceBreakdown}>
          <View style={styles.balanceItem}>
            <View style={styles.incomeDot} />
            <View>
              <Text style={styles.balanceMeta}>Tổng thu</Text>
              <Text style={styles.balanceAmount}>{formatVndAmount(income)}</Text>
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <View style={styles.expenseDot} />
            <View>
              <Text style={styles.balanceMeta}>Tổng chi</Text>
              <Text style={styles.balanceAmount}>{formatVndAmount(expenses)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <View style={styles.listTitleWrap}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          <Text style={styles.sectionHint}>
            {transactions.length}/{MAX_TRANSACTIONS} mục tối đa ·{' '}
            {isFromApi ? 'Thao tác ghi chưa đồng bộ' : 'Dữ liệu mẫu trong phiên'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thêm giao dịch"
          onPress={openNewTransaction}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <AppIcon name={{ ios: 'plus', android: 'add', web: 'add' }} glyph="+" tintColor="#FFFFFF" size={17} />
          <Text style={styles.addButtonText}>Thêm</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {(['Tất cả', 'Thu', 'Chi'] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === option }}
            onPress={() => setFilter(option)}
            style={[styles.filter, filter === option && styles.filterActive]}>
            <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      {visibleTransactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <AppIcon name={{ ios: 'tray', android: 'inbox', web: 'inbox' }} glyph="▣" tintColor={Palette.blue} size={24} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có giao dịch {filter === 'Tất cả' ? 'nào' : filter.toLowerCase()}</Text>
          <Text style={styles.emptyHint}>Thêm một khoản mới để bắt đầu theo dõi.</Text>
        </View>
      ) : (
        <View style={styles.transactionList}>
          {visibleTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={() => openEditTransaction(transaction)}
              onDelete={() => setDeleting(transaction)}
            />
          ))}
        </View>
      )}

      <Text style={styles.footnote}>
        {isFromApi
          ? 'Đã nhận dữ liệu API · Thao tác thêm, sửa, xóa chưa gửi lên máy chủ.'
          : 'Dữ liệu mẫu chỉ nằm trong bộ nhớ phiên này, không được gửi hoặc lưu vào cơ sở dữ liệu.'}
      </Text>

      <Modal
        visible={formVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeForm}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeForm} />
          <View style={styles.formSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  {editingId === -1 ? 'Thêm giao dịch' : 'Sửa giao dịch'}
                </Text>
                <Text style={styles.sheetSubtitle}>Thông tin chỉ lưu trong phiên hiện tại.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Đóng biểu mẫu"
                onPress={closeForm}
                style={styles.closeButton}>
                <AppIcon name={{ ios: 'xmark', android: 'close', web: 'close' }} glyph="×" tintColor={Palette.muted} size={17} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>LOẠI GIAO DỊCH</Text>
              <View style={styles.typePicker}>
                {(['Thu', 'Chi'] as const).map((type) => (
                  <Pressable
                    key={type}
                    accessibilityRole="button"
                    accessibilityState={{ selected: form.type === type }}
                    onPress={() => setForm((current) => ({ ...current, type }))}
                    style={[
                      styles.typeOption,
                      form.type === type && (type === 'Thu' ? styles.incomeOption : styles.expenseOption),
                    ]}>
                    <Text
                      style={[
                        styles.typeOptionText,
                        form.type === type && (type === 'Thu' ? styles.incomeOptionText : styles.expenseOptionText),
                      ]}>
                      {type === 'Thu' ? '+  Khoản thu' : '−  Khoản chi'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <FormField
                label="TÊN GIAO DỊCH"
                placeholder="Ví dụ: Mua đồ dùng"
                value={form.name}
                maxLength={48}
                onChangeText={(name) => setForm((current) => ({ ...current, name }))}
              />
              <FormField
                label="DANH MỤC"
                placeholder="Ví dụ: Ăn uống, lương"
                value={form.category}
                maxLength={32}
                onChangeText={(category) => setForm((current) => ({ ...current, category }))}
              />
              <FormField
                label="SỐ TIỀN (VNĐ)"
                placeholder="0"
                value={form.amount}
                keyboardType="numeric"
                maxLength={17}
                onChangeText={(amount) => setForm((current) => ({ ...current, amount }))}
              />
              <FormField
                label="GHI CHÚ (KHÔNG BẮT BUỘC)"
                placeholder="Thêm thông tin nếu cần"
                value={form.note}
                maxLength={160}
                multiline
                onChangeText={(note) => setForm((current) => ({ ...current, note }))}
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <Pressable
                accessibilityRole="button"
                onPress={saveTransaction}
                style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
                <Text style={styles.saveButtonText}>
                  {editingId === -1 ? 'Tạo giao dịch' : 'Lưu thay đổi'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={deleting !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDeleting(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDeleting(null)} />
          <View style={styles.confirmCard}>
            <View style={styles.deleteIcon}>
              <AppIcon name={{ ios: 'trash.fill', android: 'delete', web: 'delete' }} glyph="×" tintColor="#C75D62" size={20} />
            </View>
            <Text style={styles.confirmTitle}>Xóa giao dịch này?</Text>
            <Text style={styles.confirmText}>Khoản thu chi sẽ bị xóa khỏi danh sách hiện tại.</Text>
            <View style={styles.confirmActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDeleting(null)}
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={confirmDelete}
                style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Xóa giao dịch</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIncome = transaction.type === 'Thu';
  const tint = isIncome ? '#358669' : Palette.blue;
  return (
    <View style={styles.transactionCard}>
      <View style={[styles.transactionIcon, { backgroundColor: isIncome ? '#E8F5EF' : Palette.blueSoft }]}>
        <AppIcon
          name={{
            ios: isIncome ? 'arrow.down.left' : 'arrow.up.right',
            android: isIncome ? 'south_west' : 'north_east',
            web: isIncome ? 'south_west' : 'north_east',
          }}
          glyph={isIncome ? '↙' : '↗'}
          tintColor={tint}
          size={18}
        />
      </View>
      <View style={styles.transactionBody}>
        <View style={styles.transactionHeading}>
          <Text style={styles.transactionName} numberOfLines={1}>{transaction.name}</Text>
          <Text style={[styles.amount, { color: tint }]}>
            {isIncome ? '+' : '−'}{formatVndAmount(transaction.amount)}
          </Text>
        </View>
        <View style={styles.transactionMeta}>
          <Text style={styles.category}>{transaction.category}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.date}>{transaction.date}</Text>
        </View>
        {!!transaction.note && <Text style={styles.note} numberOfLines={2}>{transaction.note}</Text>}
        <View style={styles.cardDivider} />
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sửa giao dịch ${transaction.name}`}
            onPress={onEdit}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <AppIcon name={{ ios: 'pencil', android: 'edit', web: 'edit' }} glyph="✎" tintColor={Palette.blue} size={14} />
            <Text style={styles.editText}>Sửa</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Xóa giao dịch ${transaction.name}`}
            onPress={onDelete}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <AppIcon name={{ ios: 'trash', android: 'delete', web: 'delete' }} glyph="×" tintColor="#C75D62" size={14} />
            <Text style={styles.deleteText}>Xóa</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FormField({
  label,
  multiline,
  ...inputProps
}: {
  label: string;
  multiline?: boolean;
} & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor="#92A2B7"
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  brandMark: { width: 36, height: 36, borderRadius: 11, backgroundColor: Palette.blueSoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  eyebrow: { color: Palette.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  spacer: { flex: 1 },
  sampleBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: Palette.blueSoft },
  sampleBadgeText: { color: Palette.blueDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  title: { color: Palette.ink, fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: Palette.muted, fontSize: 11, marginTop: 6 },
  balanceCard: { padding: 18, marginTop: 20, borderRadius: 18, backgroundColor: '#245EAD' },
  balanceLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  balanceValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 8 },
  balanceBreakdown: { flexDirection: 'row', alignItems: 'center', marginTop: 18, paddingTop: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.22)' },
  balanceItem: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  incomeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#82D5B1', marginTop: 4, marginRight: 7 },
  expenseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#9FC5FA', marginTop: 4, marginRight: 7 },
  balanceMeta: { color: 'rgba(255,255,255,0.72)', fontSize: 9 },
  balanceAmount: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginTop: 4 },
  balanceDivider: { width: 1, height: 31, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 13 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  listTitleWrap: { flex: 1, marginRight: 8 },
  sectionTitle: { color: Palette.ink, fontSize: 15, fontWeight: '800' },
  sectionHint: { color: Palette.muted, fontSize: 9, marginTop: 4 },
  addButton: { height: 36, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 11, backgroundColor: Palette.blue },
  addButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 7, marginBottom: 12 },
  filter: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EAF0F7' },
  filterActive: { backgroundColor: Palette.blue },
  filterText: { color: Palette.muted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  transactionList: { gap: 10 },
  transactionCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 13, borderRadius: 15, backgroundColor: Palette.surface, borderWidth: 1, borderColor: '#E8EEF5' },
  transactionIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  transactionBody: { flex: 1, minWidth: 0 },
  transactionHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 7 },
  transactionName: { flex: 1, color: Palette.ink, fontSize: 12, fontWeight: '800', paddingTop: 2 },
  amount: { flexShrink: 0, fontSize: 11, fontWeight: '800', paddingTop: 2 },
  transactionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  category: { color: Palette.blueDark, fontSize: 9, fontWeight: '700' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#A7B4C3' },
  date: { color: Palette.muted, fontSize: 9 },
  note: { color: Palette.muted, fontSize: 9, lineHeight: 14, marginTop: 6 },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.line, marginTop: 10, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 7 },
  actionButton: { minWidth: 53, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: Palette.blueSoft },
  editText: { color: Palette.blueDark, fontSize: 9, fontWeight: '700' },
  deleteText: { color: '#B65358', fontSize: 9, fontWeight: '700' },
  pressed: { opacity: 0.76 },
  emptyCard: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 22, borderRadius: 16, backgroundColor: Palette.surface, borderWidth: 1, borderColor: '#E8EEF5' },
  emptyIcon: { width: 47, height: 47, borderRadius: 14, backgroundColor: Palette.blueSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  emptyTitle: { color: Palette.ink, fontSize: 13, fontWeight: '800' },
  emptyHint: { color: Palette.muted, textAlign: 'center', fontSize: 10, marginTop: 5 },
  footnote: { color: '#8292A6', textAlign: 'center', fontSize: 8, lineHeight: 13, marginTop: 17 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 10, paddingTop: 30, backgroundColor: 'rgba(22,38,60,0.4)' },
  formSheet: { width: '100%', maxWidth: 540, maxHeight: '92%', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22, borderTopLeftRadius: 21, borderTopRightRadius: 21, backgroundColor: '#FFFFFF' },
  sheetHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#DCE5EF', marginBottom: 15 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  sheetTitle: { color: Palette.ink, fontSize: 18, fontWeight: '800' },
  sheetSubtitle: { color: Palette.muted, fontSize: 9, marginTop: 4 },
  closeButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F0F4F9', alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: 11 },
  fieldLabel: { color: '#64768D', fontSize: 8, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  input: { minHeight: 43, paddingHorizontal: 12, borderWidth: 1, borderColor: '#DFE7F0', borderRadius: 10, color: Palette.ink, fontSize: 12, backgroundColor: '#FAFCFE' },
  textArea: { minHeight: 66, paddingTop: 10 },
  typePicker: { flexDirection: 'row', gap: 8, marginBottom: 13 },
  typeOption: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 38, borderRadius: 9, backgroundColor: '#F0F4F9' },
  typeOptionText: { color: Palette.muted, fontSize: 10, fontWeight: '700' },
  incomeOption: { backgroundColor: '#E7F4EE' },
  expenseOption: { backgroundColor: Palette.blueSoft },
  incomeOptionText: { color: '#328566' },
  expenseOptionText: { color: Palette.blueDark },
  errorText: { color: '#B65358', fontSize: 10, marginBottom: 9 },
  saveButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.blue, marginTop: 4 },
  saveButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  confirmCard: { width: '100%', maxWidth: 360, padding: 20, marginVertical: 'auto', borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center' },
  deleteIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  confirmTitle: { color: Palette.ink, fontSize: 16, fontWeight: '800' },
  confirmText: { color: Palette.muted, textAlign: 'center', fontSize: 10, lineHeight: 16, marginTop: 7 },
  confirmActions: { flexDirection: 'row', gap: 8, width: '100%', marginTop: 17 },
  cancelButton: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#F0F4F9' },
  cancelText: { color: '#62748B', fontSize: 10, fontWeight: '700' },
  deleteButton: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#C75D62' },
  deleteButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
