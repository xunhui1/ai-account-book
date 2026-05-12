import { Platform, Linking, Alert } from 'react-native';

/**
 * 通知监听 & 悬浮窗权限管理工具
 * 
 * Android 需要两个权限：
 * 1. 通知访问权限（NotificationListenerService）
 * 2. 悬浮窗权限（SYSTEM_ALERT_WINDOW）
 */

/**
 * 打开「通知访问」设置页面
 * 用户需要在此页面手动开启本APP的通知访问权限
 */
export function openNotificationListenerSettings() {
  if (Platform.OS !== 'android') return;
  Linking.openSettings(); // 先跳到APP设置
  // 更精确的跳转：
  Linking.openURL('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS').catch(() => {
    Linking.openSettings();
  });
}

/**
 * 打开「悬浮窗」权限设置页面
 */
export function openOverlayPermissionSettings() {
  if (Platform.OS !== 'android') return;
  Linking.openURL('package:com.aiaccountbook.app').catch(() => {
    Linking.openSettings();
  });
}

/**
 * 引导用户开启自动记账所需的权限
 */
export function guideAutoRecordPermissions() {
  Alert.alert(
    '开启智能记账',
    '需要以下权限才能自动识别支付通知：\n\n1️⃣ 通知访问权限 — 读取支付通知\n2️⃣ 悬浮窗权限 — 显示记账卡片\n\n请在接下来的设置页面中开启。',
    [
      { text: '稍后再说', style: 'cancel' },
      {
        text: '去设置',
        onPress: () => {
          openNotificationListenerSettings();
        },
      },
    ]
  );
}

/**
 * 支付信息类型
 */
export interface PaymentInfo {
  amount: number;
  merchant: string;
  source: string; // "微信支付" | "支付宝" | "银行卡" | "短信"
  timestamp: number;
}

/**
 * 监听支付通知事件（预留接口）
 * 当原生Bridge完成后，此处接收来自 NotificationListener 的事件
 */
export function onPaymentDetected(callback: (info: PaymentInfo) => void): () => void {
  // TODO: 接入 NativeEventEmitter
  // const emitter = new NativeEventEmitter(NativeModules.PaymentListenerModule);
  // const sub = emitter.addListener('onPaymentDetected', callback);
  // return () => sub.remove();
  
  console.log('[AutoRecord] 监听器已注册，等待支付通知...');
  return () => {};
}
