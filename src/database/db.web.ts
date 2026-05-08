/**
 * Web-compatible storage layer using localStorage
 * Used as a fallback when expo-sqlite is not available (Web platform)
 */
import { Record } from '../types';

const STORAGE_KEY = 'ai_account_book_records';

function getAll(): Record[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(records: Record[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function insertRecord(record: Record): Promise<void> {
  const records = getAll();
  records.push(record);
  saveAll(records);
}

export async function getRecordsByDate(date: string): Promise<Record[]> {
  const records = getAll();
  return records
    .filter(r => r.date.startsWith(date))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRecordsByMonth(month: string): Promise<Record[]> {
  const records = getAll();
  return records
    .filter(r => r.date.startsWith(month))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function deleteRecord(id: string): Promise<void> {
  const records = getAll().filter(r => r.id !== id);
  saveAll(records);
}

export async function getMonthlyStats(month: string) {
  const records = getAll().filter(r => r.date.startsWith(month));
  
  const totalExpense = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const categoryMap = new Map<string, number>();
  records
    .filter(r => r.type === 'expense')
    .forEach(r => {
      categoryMap.set(r.categoryId, (categoryMap.get(r.categoryId) || 0) + r.amount);
    });
  
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);

  return { totalExpense, totalIncome, categoryBreakdown };
}
