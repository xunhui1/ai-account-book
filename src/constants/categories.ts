// 账单分类配置
export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'expense' | 'income';
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', icon: '🍜', type: 'expense' },
  { id: 'transport', name: '交通', icon: '🚗', type: 'expense' },
  { id: 'shopping', name: '购物', icon: '🛒', type: 'expense' },
  { id: 'entertainment', name: '娱乐', icon: '🎮', type: 'expense' },
  { id: 'housing', name: '住房', icon: '🏠', type: 'expense' },
  { id: 'medical', name: '医疗', icon: '💊', type: 'expense' },
  { id: 'education', name: '教育', icon: '📚', type: 'expense' },
  { id: 'daily', name: '日用', icon: '🧴', type: 'expense' },
  { id: 'social', name: '社交', icon: '🎁', type: 'expense' },
  { id: 'other_expense', name: '其他', icon: '💰', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: '工资', icon: '💼', type: 'income' },
  { id: 'bonus', name: '奖金', icon: '🏆', type: 'income' },
  { id: 'investment', name: '投资', icon: '📈', type: 'income' },
  { id: 'freelance', name: '兼职', icon: '💻', type: 'income' },
  { id: 'gift', name: '红包', icon: '🧧', type: 'income' },
  { id: 'other_income', name: '其他', icon: '💵', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find(c => c.id === id);
}
