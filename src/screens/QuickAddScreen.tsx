import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import dayjs from 'dayjs';
import { Record } from '../types';
import { insertRecord } from '../database/db';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Category } from '../constants/categories';

interface Props {
  route?: { params?: { type?: 'expense' | 'income' } };
  navigation: any;
}

/**
 * 快速记账页面 - 从快捷方式/Widget 直接打开
 * 极简界面：金额 + 分类，一键保存
 */
export default function QuickAddScreen({ route, navigation }: Props) {
  const initialType = route?.params?.type || 'expense';
  const [type] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    initialType === 'expense' ? 'food' : 'salary'
  );

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleQuickSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const record: Record = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      amount: numAmount,
      type,
      categoryId: selectedCategory,
      note: '快捷记账',
      date: dayjs().format('YYYY-MM-DD'),
      createdAt: dayjs().toISOString(),
    };

    await insertRecord(record);
    
    // 保存后关闭或返回首页
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('记账');
    }
  };

  // 数字键盘按键
  const handleKeyPress = (key: string) => {
    if (key === 'del') {
      setAmount(prev => prev.slice(0, -1));
    } else if (key === '.' && amount.includes('.')) {
      return;
    } else {
      setAmount(prev => prev + key);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部标题 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {type === 'expense' ? '⚡ 快速记支出' : '⚡ 快速记收入'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* 金额显示 */}
      <View style={styles.amountDisplay}>
        <Text style={styles.currencySign}>¥</Text>
        <Text style={styles.amountText}>{amount || '0'}</Text>
      </View>

      {/* 分类快选 - 横向滚动 */}
      <View style={styles.categoryRow}>
        {categories.slice(0, 6).map((cat: Category) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
            <Text style={styles.categoryChipText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 自定义数字键盘 */}
      <View style={styles.keyboard}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(key => (
          <TouchableOpacity
            key={key}
            style={styles.keyBtn}
            onPress={() => handleKeyPress(key)}
          >
            <Text style={styles.keyText}>{key === 'del' ? '⌫' : key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 保存按钮 */}
      <TouchableOpacity
        style={[styles.saveBtn, !amount && styles.saveBtnDisabled]}
        onPress={handleQuickSave}
        disabled={!amount}
      >
        <Text style={styles.saveBtnText}>✓ 保存</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeBtn: { fontSize: 22, color: '#999' },
  title: { fontSize: 17, fontWeight: 'bold' },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  currencySign: { fontSize: 28, color: '#333', marginRight: 4 },
  amountText: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryChipActive: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50' },
  categoryChipIcon: { fontSize: 16, marginRight: 4 },
  categoryChipText: { fontSize: 13 },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
  },
  keyBtn: {
    width: '30%',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  keyText: { fontSize: 22, fontWeight: '500', color: '#333' },
  saveBtn: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#ccc' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
