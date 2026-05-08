import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 配置通知显示方式
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 注册通知权限
export async function registerNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('通知权限未授予');
    return false;
  }
  return true;
}

// 设置每日记账提醒
export async function scheduleDailyReminder(hour: number = 21, minute: number = 0) {
  // 先取消之前的提醒
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📝 别忘了记账',
      body: '今天的花费记录了吗？点击快速记一笔',
      data: { action: 'quick_add' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// 取消所有提醒
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
