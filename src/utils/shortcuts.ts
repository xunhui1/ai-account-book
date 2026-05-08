import { AppRegistry } from 'react-native';
import { createShortcut, ShortcutItem } from 'react-native-quick-actions';

// 定义 App Shortcuts（安卓长按图标显示的快捷方式）
export const APP_SHORTCUTS: ShortcutItem[] = [
  {
    type: 'quick_expense',
    title: '快速记支出',
    subtitle: '一键记录支出',
    icon: 'shortcut_expense', // 需要在 android/app/src/main/res 放对应图标
  },
  {
    type: 'quick_income',
    title: '记录收入',
    subtitle: '一键记录收入',
    icon: 'shortcut_income',
  },
  {
    type: 'quick_ai',
    title: 'AI记账',
    subtitle: '语音/文字智能记账',
    icon: 'shortcut_ai',
  },
];

// 初始化快捷方式
export function setupShortcuts() {
  APP_SHORTCUTS.forEach(shortcut => {
    createShortcut(shortcut);
  });
}

// 处理快捷方式跳转的 action type
export function getInitialRoute(shortcutType: string | null): string {
  switch (shortcutType) {
    case 'quick_expense':
      return 'QuickAdd_Expense';
    case 'quick_income':
      return 'QuickAdd_Income';
    case 'quick_ai':
      return 'AI助手';
    default:
      return '记账';
  }
}
