import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PaymentListenerModule } = NativeModules;

/**
 * 支付信息类型
 */
export interface PaymentInfo {
  amount: number;
  merchant: string;
  source: '微信支付' | '支付宝' | '银行卡' | '短信';
  timestamp: number;
  rawContent?: string;
}

/**
 * 权限状态
 */
export interface PermissionStatus {
  notificationListener: boolean;
  overlay: boolean;
}

/**
 * 检查通知监听权限是否已开启
 */
export async function isNotificationListenerEnabled(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PaymentListenerModule) return false;
  return PaymentListenerModule.isNotificationListenerEnabled();
}

/**
 * 检查悬浮窗权限是否已开启
 */
export async function isOverlayPermissionGranted(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PaymentListenerModule) return false;
  return PaymentListenerModule.isOverlayPermissionGranted();
}

/**
 * 获取所有权限状态
 */
export async function getPermissionStatus(): Promise<PermissionStatus> {
  const [notificationListener, overlay] = await Promise.all([
    isNotificationListenerEnabled(),
    isOverlayPermissionGranted(),
  ]);
  return { notificationListener, overlay };
}

/**
 * 打开通知监听设置页面
 */
export function openNotificationListenerSettings(): void {
  if (Platform.OS !== 'android' || !PaymentListenerModule) return;
  PaymentListenerModule.openNotificationListenerSettings();
}

/**
 * 打开悬浮窗权限设置页面
 */
export function openOverlaySettings(): void {
  if (Platform.OS !== 'android' || !PaymentListenerModule) return;
  PaymentListenerModule.openOverlaySettings();
}

/**
 * 测试灵动岛效果（开发调试）
 */
export function testFloatingIsland(amount: number = 35.0, merchant: string = '测试商户', source: string = '微信支付'): void {
  if (Platform.OS !== 'android' || !PaymentListenerModule) return;
  PaymentListenerModule.testFloatingIsland(amount, merchant, source);
}

/**
 * 监听支付通知事件
 * 
 * @param callback 支付回调，收到支付通知时触发
 * @returns 取消监听的函数
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   const unsubscribe = onPaymentDetected((info) => {
 *     console.log(`检测到支付: ¥${info.amount} - ${info.merchant}`);
 *     // 自动写入数据库...
 *   });
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function onPaymentDetected(callback: (info: PaymentInfo) => void): () => void {
  if (Platform.OS !== 'android' || !PaymentListenerModule) {
    return () => {};
  }

  const emitter = new NativeEventEmitter(PaymentListenerModule);
  const subscription = emitter.addListener('onPaymentDetected', (event) => {
    const info: PaymentInfo = {
      amount: event.amount,
      merchant: event.merchant,
      source: event.source,
      timestamp: event.timestamp,
      rawContent: event.rawContent,
    };
    callback(info);
  });

  return () => subscription.remove();
}
