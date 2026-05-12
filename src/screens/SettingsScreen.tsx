import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { guideAutoRecordPermissions } from '../utils/autoRecord';

export default function SettingsScreen() {
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(false);

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
        <Text style={styles.sectionTitle}>智能记账</Text>
        <View style={styles.item}>
          <View style={{flex: 1}}>
            <Text style={styles.itemLabel}>🏝️ 灵动岛自动记账</Text>
            <Text style={{fontSize: 12, color: '#999', marginTop: 2}}>支付后自动弹出记账卡片</Text>
          </View>
          <Switch
            value={autoRecordEnabled}
            onValueChange={(value) => {
              if (value && Platform.OS === 'android') {
                guideAutoRecordPermissions();
              }
              setAutoRecordEnabled(value);
            }}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor={autoRecordEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
        <TouchableOpacity style={styles.item} onPress={() => {
          Alert.alert('监听范围', '选择要自动识别的支付渠道', [
            { text: '全部开启', onPress: () => {} },
            { text: '自定义', onPress: () => {} },
            { text: '取消', style: 'cancel' },
          ]);
        }}>
          <Text style={styles.itemLabel}>监听范围</Text>
          <Text style={styles.itemValue}>微信 · 支付宝 · 银行 →</Text>
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
