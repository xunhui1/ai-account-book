import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Platform, Linking, ActivityIndicator } from 'react-native';
import { guideAutoRecordPermissions } from '../utils/autoRecord';
import { checkForUpdate, APP_VERSION } from '../utils/updateChecker';

export default function SettingsScreen() {
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ hasUpdate: boolean; version?: string; url?: string; changelog?: string } | null>(null);
  const [checking, setChecking] = useState(false);

  // 进入设置页时自动检查更新
  useEffect(() => {
    handleCheckUpdate(true);
  }, []);

  async function handleCheckUpdate(silent: boolean = false) {
    setChecking(true);
    try {
      const info = await checkForUpdate();
      setUpdateInfo(info);
      if (!silent && !info.hasUpdate) {
        Alert.alert('已是最新版', `当前版本 v${APP_VERSION} 已是最新`);
      }
    } catch (e) {
      if (!silent) {
        Alert.alert('检查失败', '无法连接更新服务器，请稍后重试');
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* 更新提示横幅 */}
      {updateInfo?.hasUpdate && (
        <TouchableOpacity
          style={styles.updateBanner}
          onPress={() => {
            if (updateInfo.url) {
              Linking.openURL(updateInfo.url);
            }
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.updateTitle}>🎉 发现新版本 v{updateInfo.version}</Text>
            {updateInfo.changelog && (
              <Text style={styles.updateChangelog} numberOfLines={2}>{updateInfo.changelog}</Text>
            )}
          </View>
          <Text style={styles.updateBtn}>立即更新 →</Text>
        </TouchableOpacity>
      )}

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
        <TouchableOpacity
          style={styles.item}
          onPress={() => handleCheckUpdate(false)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>版本</Text>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              {updateInfo?.hasUpdate ? `有新版本 v${updateInfo.version} 可用` : '已是最新版本'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {checking && <ActivityIndicator size="small" color="#4CAF50" style={{ marginRight: 8 }} />}
            <Text style={[styles.itemValue, updateInfo?.hasUpdate && { color: '#4CAF50', fontWeight: 'bold' }]}>
              v{APP_VERSION} {updateInfo?.hasUpdate ? '↑' : '✓'}
            </Text>
          </View>
        </TouchableOpacity>
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
  updateBanner: {
    backgroundColor: '#E8F5E9',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  updateTitle: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32' },
  updateChangelog: { fontSize: 12, color: '#558B2F', marginTop: 4 },
  updateBtn: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
});
