import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI 配置</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemLabel}>MiMo API Key</Text>
          <Text style={styles.itemValue}>点击配置 →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemLabel}>模型选择</Text>
          <Text style={styles.itemValue}>MiMo-V2.5-Reasoning</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据管理</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemLabel}>导出数据</Text>
          <Text style={styles.itemValue}>CSV →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => Alert.alert('提示', '功能开发中')}
        >
          <Text style={styles.itemLabel}>清空所有数据</Text>
          <Text style={[styles.itemValue, { color: '#F44336' }]}>⚠️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>版本</Text>
          <Text style={styles.itemValue}>1.0.0</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>AI 模型</Text>
          <Text style={styles.itemValue}>Xiaomi MiMo</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', marginTop: 12, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, color: '#999', paddingVertical: 12 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  itemLabel: { fontSize: 15, color: '#333' },
  itemValue: { fontSize: 14, color: '#999' },
});
