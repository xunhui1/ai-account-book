import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { onPaymentDetected, PaymentInfo } from '../utils/autoRecord';
import { insertRecord } from '../database/db';
import { EXPENSE_CATEGORIES } from '../constants/categories';

/**
 * 根据商户名智能推断消费类别
 */
function inferCategory(merchant: string): string {
  const lower = merchant.toLowerCase();

  // 餐饮
  if (['外卖', '美团', '饿了么', '餐厅', '饭店', '小吃', '面馆', '火锅',
       '烧烤', '奶茶', '咖啡', '星巴克', '瑞幸', '肯德基', 'kfc',
       '麦当劳', '必胜客', '海底捞', '食堂', '早餐', '午餐', '晚餐',
       '蜜雪冰城', '茶百道', '喜茶', '瑞幸咖啡'].some(k => lower.includes(k))) {
    return 'food';
  }

  // 交通
  if (['滴滴', '打车', '出租', '地铁', '公交', '高铁', '火车', '飞机',
       '机票', '加油', '停车', '高速', '骑行', '哈啰', '青桔', '美团单车',
       '铁路', '航空', '12306'].some(k => lower.includes(k))) {
    return 'transport';
  }

  // 购物
  if (['淘宝', '京东', '拼多多', '天猫', '苏宁', '唯品会', '抖音商城',
       '超市', '便利店', '盒马', '永辉', '沃尔玛', '家乐福', '711',
       '全家', '罗森'].some(k => lower.includes(k))) {
    return 'shopping';
  }

  // 娱乐
  if (['电影', '游戏', '网吧', 'steam', '腾讯游戏', '网易游戏',
       'ktv', '密室', '剧本杀', '演出', '票务', '大麦', 'bilibili',
       '会员', 'vip', '视频'].some(k => lower.includes(k))) {
    return 'entertainment';
  }

  // 住房
  if (['房租', '物业', '水费', '电费', '燃气', '暖气', '宽带',
       '网费', '话费', '充值', '移动', '联通', '电信'].some(k => lower.includes(k))) {
    return 'housing';
  }

  // 医疗
  if (['医院', '药店', '药房', '诊所', '体检', '挂号', '门诊',
       '医药', '健康'].some(k => lower.includes(k))) {
    return 'medical';
  }

  // 教育
  if (['书店', '课程', '培训', '学费', '教材', '考试', '报名'].some(k => lower.includes(k))) {
    return 'education';
  }

  // 日用
  if (['洗衣', '理发', '美容', '快递', '物流', '维修', '保洁'].some(k => lower.includes(k))) {
    return 'daily';
  }

  // 社交
  if (['红包', '转账', '礼物', '份子', '请客'].some(k => lower.includes(k))) {
    return 'social';
  }

  return 'other_expense';
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * useAutoRecord Hook
 * 
 * 在 APP 启动时自动监听支付通知，解析后写入数据库
 * 
 * @param enabled 是否启用自动记账
 * 
 * @example
 * ```tsx
 * function App() {
 *   useAutoRecord(true);
 *   return <MainTabs />;
 * }
 * ```
 */
export function useAutoRecord(enabled: boolean = true) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (Platform.OS !== 'android' || !enabled) return;

    const unsubscribe = onPaymentDetected(async (info: PaymentInfo) => {
      if (!enabledRef.current) return;

      try {
        const categoryId = inferCategory(info.merchant);
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

        const record = {
          id: generateId(),
          amount: info.amount,
          type: 'expense' as const,
          categoryId,
          note: `[自动] ${info.merchant} (${info.source})`,
          date: dateStr,
          createdAt: now.toISOString(),
        };

        await insertRecord(record);
        console.log(`[AutoRecord] ✅ 已自动记录: ¥${info.amount} - ${info.merchant} → ${categoryId}`);
      } catch (error) {
        console.error('[AutoRecord] ❌ 自动记账失败:', error);
      }
    });

    console.log('[AutoRecord] 🎧 支付监听已启动');
    return () => {
      unsubscribe();
      console.log('[AutoRecord] 🔇 支付监听已停止');
    };
  }, [enabled]);
}
