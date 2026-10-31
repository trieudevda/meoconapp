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
import { type ApprovalRequest, useAppSectionState, useSessionData } from '@/data/app-data';
import { formatVndAmount, formatVndInput, parseVndAmount, sumVndAmounts } from '@/utils/money';

type RequestForm = Omit<Pick<ApprovalRequest, 'name' | 'link' | 'description' | 'price'>, 'price'> & {
  price: string;
};

const emptyForm: RequestForm = { name: '', link: '', description: '', price: '' };
const MAX_REQUESTS = 50;

export default function RequestsScreen() {
  const { data: requestsFromApi, isFromApi } = useAppSectionState('requests');
  const [requests, setRequests] = useSessionData(requestsFromApi, MAX_REQUESTS);
  const [form, setForm] = useState<RequestForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<ApprovalRequest | null>(null);
  const [error, setError] = useState('');
  const formVisible =
    editingId !== null ||
    form.name !== '' ||
    form.link !== '' ||
    form.description !== '' ||
    form.price !== '';
  const pendingCount = requests.filter((request) => request.status === 'Chờ duyệt').length;
  const totalValue = sumVndAmounts(requests.map((request) => request.price));

  function openNewRequest() {
    setEditingId(-1);
    setForm(emptyForm);
    setError('');
  }

  function openEditRequest(request: ApprovalRequest) {
    setEditingId(request.id);
    setForm({
      name: request.name,
      link: request.link,
      description: request.description,
      price: formatVndInput(String(request.price)),
    });
    setError('');
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function saveRequest() {
    const amount = parseVndAmount(form.price);
    if (
      !form.name.trim() ||
      !form.link.trim() ||
      !form.description.trim() ||
      amount === null
    ) {
      setError('Điền đủ thông tin và nhập giá từ 1 đến 1.000.000.000.000 ₫.');
      return;
    }
    if (editingId === null) return;

    if (editingId === -1) {
      if (requests.length >= MAX_REQUESTS) {
        setError(`Đã đạt giới hạn ${MAX_REQUESTS} yêu cầu hiển thị.`);
        return;
      }
      const nextId = requests.reduce((highestId, request) => Math.max(highestId, request.id), 0) + 1;
      setRequests((current) => [
        {
          ...form,
          name: form.name.trim(),
          link: form.link.trim(),
          description: form.description.trim(),
          price: amount,
          id: nextId,
          status: 'Chờ duyệt',
          category: 'YÊU CẦU MỚI',
          color: Palette.blueSoft,
        },
        ...current.slice(0, MAX_REQUESTS - 1),
      ]);
    } else {
      setRequests((current) =>
        current.map((request) =>
          request.id === editingId
            ? {
                ...request,
                ...form,
                name: form.name.trim(),
                link: form.link.trim(),
                description: form.description.trim(),
                price: amount,
              }
            : request,
        ),
      );
    }
    closeForm();
  }

  function confirmDelete() {
    if (!deleting) return;
    setRequests((current) => current.filter((request) => request.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <Page>
      <View style={styles.topLine}>
        <View style={styles.brandMark}>
          <AppIcon name={{ ios: 'doc.text.fill', android: 'description', web: 'description' }} glyph="▤" tintColor={Palette.blue} />
        </View>
        <Text style={styles.eyebrow}>QUẢN LÝ CÁ NHÂN</Text>
        <View style={styles.topSpacer} />
        <View style={styles.countBubble}>
          <Text style={styles.countBubbleText}>{requests.length}</Text>
        </View>
      </View>
      <Text style={styles.title}>Đơn xin duyệt</Text>
      <Text style={styles.subtitle}>Theo dõi những khoản bạn muốn đề xuất.</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>ĐANG CHỜ</Text>
          <Text style={styles.summaryValue}>
            {pendingCount}
            <Text style={styles.summaryUnit}> đơn</Text>
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TỔNG ĐỀ XUẤT</Text>
          <Text style={styles.summaryValue}>
            {formatVndAmount(totalValue)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <View>
          <Text style={styles.sectionTitle}>Yêu cầu của bạn</Text>
          <Text style={styles.sectionHint}>
            {requests.length}/{MAX_REQUESTS} mục ·{' '}
            {isFromApi ? 'Thao tác ghi chưa đồng bộ' : 'Dữ liệu mẫu trong phiên'}
          </Text>
        </View>
        <Pressable
          onPress={openNewRequest}
          accessibilityRole="button"
          accessibilityLabel="Thêm yêu cầu"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <AppIcon name={{ ios: 'plus', android: 'add', web: 'add' }} glyph="+" tintColor="#FFFFFF" size={17} />
          <Text style={styles.addButtonText}>Thêm đơn</Text>
        </Pressable>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <AppIcon name={{ ios: 'tray', android: 'inbox', web: 'inbox' }} glyph="▣" tintColor={Palette.blue} size={25} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có yêu cầu nào</Text>
          <Text style={styles.emptyHint}>Thêm yêu cầu đầu tiên để bắt đầu theo dõi nhé.</Text>
        </View>
      ) : (
        <View style={styles.requestList}>
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onEdit={() => openEditRequest(request)}
              onDelete={() => setDeleting(request)}
            />
          ))}
        </View>
      )}

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
                  {editingId === -1 ? 'Thêm yêu cầu mới' : 'Chỉnh sửa yêu cầu'}
                </Text>
                <Text style={styles.sheetSubtitle}>Thông tin chỉ lưu trong phiên hiện tại.</Text>
              </View>
              <Pressable onPress={closeForm} style={styles.closeButton} accessibilityLabel="Đóng">
                <AppIcon name={{ ios: 'xmark', android: 'close', web: 'close' }} glyph="×" tintColor={Palette.muted} size={15} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <FormField
                label="TÊN YÊU CẦU"
                placeholder="Ví dụ: Màn hình làm việc"
                value={form.name}
                maxLength={64}
                onChangeText={(name) => setForm({ ...form, name })}
              />
              <FormField
                label="ĐƯỜNG DẪN"
                placeholder="https://..."
                value={form.link}
                maxLength={200}
                onChangeText={(link) => setForm({ ...form, link })}
                keyboardType="url"
                autoCapitalize="none"
              />
              <FormField
                label="MÔ TẢ"
                placeholder="Lý do hoặc thông tin thêm"
                value={form.description}
                maxLength={240}
                onChangeText={(description) => setForm({ ...form, description })}
                multiline
              />
              <FormField
                label="GIÁ DỰ KIẾN"
                placeholder="0"
                value={form.price}
                maxLength={17}
                onChangeText={(price) => setForm({ ...form, price })}
                keyboardType="numeric"
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <Pressable
                onPress={saveRequest}
                accessibilityRole="button"
                style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
                <Text style={styles.saveButtonText}>
                  {editingId === -1 ? 'Tạo yêu cầu' : 'Lưu thay đổi'}
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
              <AppIcon name={{ ios: 'trash.fill', android: 'delete', web: 'delete' }} glyph="×" tintColor="#D96363" size={20} />
            </View>
            <Text style={styles.confirmTitle}>Xóa yêu cầu này?</Text>
            <Text style={styles.confirmText}>Yêu cầu sẽ bị xóa khỏi danh sách hiển thị hiện tại.</Text>
            <View style={styles.confirmActions}>
              <Pressable onPress={() => setDeleting(null)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable onPress={confirmDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Xóa yêu cầu</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

function RequestCard({
  request,
  onEdit,
  onDelete,
}: {
  request: ApprovalRequest;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const approved = request.status === 'Đã duyệt';
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTop}>
        <View style={[styles.categoryIcon, { backgroundColor: request.color }]}>
          <AppIcon name={{ ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' }} glyph="▣" tintColor={Palette.blue} />
        </View>
        <View style={[styles.statusPill, approved ? styles.approvedPill : styles.pendingPill]}>
          <View style={[styles.statusDot, approved ? styles.approvedDot : styles.pendingDot]} />
          <Text style={[styles.statusText, approved ? styles.approvedText : styles.pendingText]}>
            {request.status}
          </Text>
        </View>
        <Text style={styles.categoryLabel}>{request.category}</Text>
      </View>
      <Text style={styles.requestName}>{request.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {request.description}
      </Text>
      <View style={styles.linkLine}>
        <AppIcon name={{ ios: 'link', android: 'link', web: 'link' }} glyph="↗" tintColor="#969AAF" size={13} />
        <Text style={styles.link} numberOfLines={1}>{request.link}</Text>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.requestFooter}>
        <View>
          <Text style={styles.priceLabel}>GIÁ DỰ KIẾN</Text>
          <Text style={styles.price}>{formatVndAmount(request.price)}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Sửa ${request.name}`}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <AppIcon name={{ ios: 'pencil', android: 'edit', web: 'edit' }} glyph="✎" tintColor={Palette.blue} size={14} />
            <Text style={styles.editText}>Sửa</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Xóa ${request.name}`}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <AppIcon name={{ ios: 'trash', android: 'delete', web: 'delete' }} glyph="×" tintColor="#D77575" size={14} />
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
        placeholderTextColor="#A7AABC"
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  brandMark: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#E3EFFD', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  eyebrow: { color: Palette.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  topSpacer: { flex: 1 },
  countBubble: { minWidth: 28, height: 28, paddingHorizontal: 8, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  countBubbleText: { color: Palette.blue, fontSize: 11, fontWeight: '800' },
  title: { color: Palette.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: Palette.muted, fontSize: 12, marginTop: 6 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', marginTop: 21, padding: 17, borderRadius: 17, backgroundColor: '#245EAD' },
  summaryItem: { flex: 1 },
  summaryLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '800', letterSpacing: 0.9, marginBottom: 8 },
  summaryValue: { color: '#FFFFFF', fontSize: 21, fontWeight: '800' },
  summaryUnit: { color: 'rgba(255,255,255,0.64)', fontSize: 11, fontWeight: '600' },
  summaryDivider: { width: 1, height: 36, marginHorizontal: 15, backgroundColor: 'rgba(255,255,255,0.15)' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 13 },
  sectionTitle: { color: Palette.ink, fontSize: 16, fontWeight: '800' },
  sectionHint: { color: Palette.muted, fontSize: 10, marginTop: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 38, borderRadius: 11, backgroundColor: Palette.blue, shadowColor: Palette.blue, shadowOpacity: 0.16, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  addButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  requestList: { gap: 12 },
  requestCard: { padding: 15, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#3A3C55', shadowOpacity: 0.025, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  requestTop: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9 },
  pendingPill: { backgroundColor: '#FFF5DF' },
  approvedPill: { backgroundColor: '#E6F6EE' },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  pendingDot: { backgroundColor: '#E8A83D' },
  approvedDot: { backgroundColor: '#40A77E' },
  statusText: { fontSize: 9, fontWeight: '700' },
  pendingText: { color: '#A87119' },
  approvedText: { color: '#348261' },
  categoryLabel: { marginLeft: 'auto', color: '#A2A5B4', fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  requestName: { color: Palette.ink, fontSize: 14, fontWeight: '800', marginTop: 13 },
  description: { color: Palette.muted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  linkLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 },
  link: { flex: 1, color: '#888CA1', fontSize: 9 },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.line, marginVertical: 13 },
  requestFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { color: '#9A9DAE', fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  price: { color: Palette.ink, fontSize: 16, fontWeight: '800', marginTop: 4 },
  priceCurrency: { color: Palette.muted, fontSize: 10, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 6 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F7F6FF' },
  editText: { color: Palette.blue, fontSize: 10, fontWeight: '700' },
  deleteText: { color: '#CF7070', fontSize: 10, fontWeight: '700' },
  pressed: { opacity: 0.74 },
  emptyCard: { alignItems: 'center', paddingVertical: 35, paddingHorizontal: 25, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EFEFF5' },
  emptyIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E8F1FC', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { color: Palette.ink, fontSize: 14, fontWeight: '800' },
  emptyHint: { color: Palette.muted, textAlign: 'center', fontSize: 10, lineHeight: 16, marginTop: 6 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 12, paddingTop: 30, backgroundColor: 'rgba(22,38,60,0.4)' },
  formSheet: { width: '100%', maxWidth: 540, maxHeight: '92%', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 25, borderTopLeftRadius: 21, borderTopRightRadius: 21, backgroundColor: '#FFFFFF' },
  sheetHandle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 3, backgroundColor: '#E2E3EB', marginBottom: 17 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 },
  sheetTitle: { color: Palette.ink, fontSize: 19, fontWeight: '800' },
  sheetSubtitle: { color: Palette.muted, fontSize: 10, marginTop: 4 },
  closeButton: { width: 33, height: 33, borderRadius: 12, backgroundColor: '#F4F5F9', alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: 12 },
  fieldLabel: { color: '#696D83', fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginBottom: 6 },
  input: { minHeight: 45, paddingHorizontal: 13, borderWidth: 1, borderColor: '#EAEBF2', borderRadius: 13, color: Palette.ink, fontSize: 12, backgroundColor: '#FBFBFD' },
  textArea: { minHeight: 76, paddingTop: 12 },
  errorText: { color: '#CB5D65', fontSize: 10, marginBottom: 10 },
  saveButton: { minHeight: 47, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.blue, marginTop: 5 },
  saveButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  confirmCard: { width: '100%', maxWidth: 360, padding: 20, marginBottom: 'auto', marginTop: 'auto', borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center' },
  deleteIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  confirmTitle: { color: Palette.ink, fontSize: 17, fontWeight: '800' },
  confirmText: { color: Palette.muted, textAlign: 'center', fontSize: 11, lineHeight: 17, marginTop: 7 },
  confirmActions: { flexDirection: 'row', gap: 9, width: '100%', marginTop: 20 },
  cancelButton: { flex: 1, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#F2F3F7' },
  cancelText: { color: '#6F7387', fontSize: 11, fontWeight: '700' },
  deleteButton: { flex: 1, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#D96363' },
  deleteButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
