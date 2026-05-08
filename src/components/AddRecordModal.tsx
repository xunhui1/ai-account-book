import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import dayjs from 'dayjs';
import { Record } from '../types';
import { insertRecord } from '../database/db';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Category } from '../constants/categories';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddRecordModal({ visible, onClose, onSaved }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [note, setNote] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return;
    }

    const record: Record = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      amount: numAmount,
      type,
      categoryId: selectedCategory,
      note,
      date: dayjs().format('YYYY-MM-DD'),
      createdAt: dayjs().toISOString(),
    };

    await insertRecord(record);
    onSaved();
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setSelectedCategory('food');
    setType('expense');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelBtn}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>记一笔</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveBtn}>保存</Text>
            </TouchableOpacity>
          </View>

          {/* 收支切换 */}
          <View style={styles.typeSwitch}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
              onPress={() => { setType('expense'); setSelectedCategory('food'); }}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>支出</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
              onPress={() => { setType('income'); setSelectedCategory('salary'); }}
            >
              <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>收入</Text>
            </TouchableOpacity>
          </View>

          {/* 金额输入 */}
          <View style={styles.amountRow}>
            <Text style={styles.currencySign}>¥</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          {/* 分类选择 */}
          <ScrollView style={styles.categoryScroll}>
            <View style={styles.categoryGrid}>
              {categories.map((cat: Category) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* 备注 */}
          <TextInput
            style={styles.noteInput}
            placeholder="添加备注..."
            value={note}
            onChangeText={setNote}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelBtn: { fontSize: 15, color: '#999' },
  title: { fontSize: 17, fontWeight: 'bold' },
  saveBtn: { fontSize: 15, color: '#4CAF50', fontWeight: 'bold' },
  typeSwitch: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 3,
  },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#F44336' },
  typeBtnActiveIncome: { backgroundColor: '#4CAF50' },
  typeText: { fontSize: 14, color: '#666' },
  typeTextActive: { color: '#fff', fontWeight: 'bold' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currencySign: { fontSize: 28, fontWeight: 'bold', color: '#333', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: 'bold', color: '#333' },
  categoryScroll: { maxHeight: 200 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  categoryItem: {
    width: '20%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  categoryItemActive: { backgroundColor: '#E8F5E9' },
  categoryIcon: { fontSize: 26 },
  categoryName: { fontSize: 11, color: '#666', marginTop: 4 },
  noteInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 14,
  },
});
