import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Record } from '../types';
import { getRecordsByDate, deleteRecord } from '../database/db';
import { getCategoryById } from '../constants/categories';
import AddRecordModal from '../components/AddRecordModal';

export default function HomeScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [todayExpense, setTodayExpense] = useState(0);
  const [todayIncome, setTodayIncome] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const today = dayjs().format('YYYY-MM-DD');

  const loadRecords = async () => {
    const data = await getRecordsByDate(today);
    setRecords(data);
    const expense = data.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const income = data.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    setTodayExpense(expense);
    setTodayIncome(income);
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(id);
          loadRecords();
        },
      },
    ]);
  };

  const renderRecord = ({ item }: { item: Record }) => {
    const category = getCategoryById(item.categoryId);
    return (
      <TouchableOpacity style={styles.recordItem} onLongPress={() => handleDelete(item.id)}>
        <View style={styles.recordLeft}>
          <Text style={styles.recordIcon}>{category?.icon || '💰'}</Text>
          <View>
            <Text style={styles.recordCategory}>{category?.name || '未分类'}</Text>
            {item.note ? <Text style={styles.recordNote}>{item.note}</Text> : null}
          </View>
        </View>
        <Text style={[styles.recordAmount, { color: item.type === 'expense' ? '#F44336' : '#4CAF50' }]}>
          {item.type === 'expense' ? '-' : '+'}¥{item.amount.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 今日概览 */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>今日支出</Text>
          <Text style={[styles.summaryAmount, { color: '#F44336' }]}>¥{todayExpense.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>今日收入</Text>
          <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>¥{todayIncome.toFixed(2)}</Text>
        </View>
      </View>

      {/* 记录列表 */}
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>今天还没有记账哦 ✨</Text>
          </View>
        }
        style={styles.list}
      />

      {/* 添加按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ 记一笔</Text>
      </TouchableOpacity>

      {/* 添加记录弹窗 */}
      <AddRecordModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadRecords}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#eee' },
  summaryLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
  summaryAmount: { fontSize: 20, fontWeight: 'bold' },
  list: { flex: 1 },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  recordLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordIcon: { fontSize: 28 },
  recordCategory: { fontSize: 15, fontWeight: '500' },
  recordNote: { fontSize: 12, color: '#999', marginTop: 2 },
  recordAmount: { fontSize: 16, fontWeight: 'bold' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#999' },
  addButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
