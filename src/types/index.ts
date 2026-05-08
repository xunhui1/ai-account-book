export interface Record {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  note: string;
  date: string; // ISO string
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalExpense: number;
  totalIncome: number;
  records: Record[];
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalExpense: number;
  totalIncome: number;
  categoryBreakdown: { categoryId: string; amount: number }[];
}
