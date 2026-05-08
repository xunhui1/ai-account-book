import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { getMonthlyStats } from '../database/db';
import { getCategoryById } from '../constants/categories';

export default function StatsScreen() {
  const [month] = useState(dayjs().format('YYYY-MM'));
  const [stats, setStats] = useState({
    totalExpense: 0,
    totalIncome: 0,
    categoryBreakdown: [] as { categoryId: string; total: number }[],
  });

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [month])
  );

  const loadStats = async () => {
    const data = await getMonthlyStats(month);
    setStats(data);
  };

  return (
    <View style={styles.container}>
      {/* 月度概览 */}
      <View style={styles.overview}>
        <Text style={styles.monthTitle}>{dayjs(month).format('YYYY年M月')}</Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>总支出</Text>
            <Text style={[styles.overviewAmount, { color: '#F44336' }]}>
              ¥{stats.totalExpense.toFixed(2)}
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>总收入</Text>
            <Text style={[styles.overviewAmount, { color: '#4CAF50' }]}>
              ¥{stats.totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>结余</Text>
            <Text style={styles.overviewAmount}>
              ¥{(stats.totalIncome - stats.totalExpense).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* 分类排行 */}
      <View style={styles.rankSection}>
        <Text style={styles.sectionTitle}>支出分类排行</Text>
        {stats.categoryBreakdown.length === 0 ? (
          <Text style={styles.emptyText}>本月暂无支出记录</Text>
        ) : (
          stats.categoryBreakdown.map((item, index) => {
            const category = getCategoryById(item.categoryId);
            const percent = stats.totalExpense > 0 ? (item.total / stats.totalExpense) * 100 : 0;
            return (
              <View key={item.categoryId} style={styles.rankItem}>
                <Text style={styles.rankIndex}>{index + 1}</Text>
                <Text style={styles.rankIcon}>{category?.icon || '💰'}</Text>
                <Text style={styles.rankName}>{category?.name || '未分类'}</Text>
                <View style={styles.rankBar}>
                  <View style={[styles.rankBarFill, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.rankAmount}>¥{item.total.toFixed(0)}</Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  overview: { backgroundColor: '#fff', padding: 20, marginBottom: 8 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-around' },
  overviewItem: { alignItems: 'center' },
  overviewLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
  overviewAmount: { fontSize: 18, fontWeight: 'bold' },
  rankSection: { backgroundColor: '#fff', padding: 16, margin: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#999', paddingVertical: 20 },
  rankItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  rankIndex: { width: 20, fontSize: 14, color: '#999' },
  rankIcon: { fontSize: 20, marginRight: 8 },
  rankName: { width: 50, fontSize: 13 },
  rankBar: { flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginHorizontal: 8 },
  rankBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  rankAmount: { fontSize: 13, fontWeight: '500', width: 60, textAlign: 'right' },
});
