import { Platform } from 'react-native';
import { Record } from '../types';

let dbModule: any = null;

async function getModule() {
  if (!dbModule) {
    if (Platform.OS === 'web') {
      dbModule = await import('./db.web');
    } else {
      // Native: use expo-sqlite
      const SQLite = await import('expo-sqlite');
      const DB_NAME = 'account_book.db';
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS records (
          id TEXT PRIMARY KEY,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          categoryId TEXT NOT NULL,
          note TEXT DEFAULT '',
          date TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
      `);
      
      dbModule = {
        insertRecord: async (record: Record) => {
          await db.runAsync(
            'INSERT INTO records (id, amount, type, categoryId, note, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [record.id, record.amount, record.type, record.categoryId, record.note, record.date, record.createdAt]
          );
        },
        getRecordsByDate: async (date: string) => {
          return await db.getAllAsync<Record>(
            'SELECT * FROM records WHERE date LIKE ? ORDER BY createdAt DESC',
            [`${date}%`]
          );
        },
        getRecordsByMonth: async (month: string) => {
          return await db.getAllAsync<Record>(
            'SELECT * FROM records WHERE date LIKE ? ORDER BY date DESC, createdAt DESC',
            [`${month}%`]
          );
        },
        deleteRecord: async (id: string) => {
          await db.runAsync('DELETE FROM records WHERE id = ?', [id]);
        },
        getMonthlyStats: async (month: string) => {
          const expense = await db.getFirstAsync<{ total: number }>(
            "SELECT COALESCE(SUM(amount), 0) as total FROM records WHERE type = 'expense' AND date LIKE ?",
            [`${month}%`]
          );
          const income = await db.getFirstAsync<{ total: number }>(
            "SELECT COALESCE(SUM(amount), 0) as total FROM records WHERE type = 'income' AND date LIKE ?",
            [`${month}%`]
          );
          const categoryStats = await db.getAllAsync<{ categoryId: string; total: number }>(
            "SELECT categoryId, SUM(amount) as total FROM records WHERE type = 'expense' AND date LIKE ? GROUP BY categoryId ORDER BY total DESC",
            [`${month}%`]
          );
          return {
            totalExpense: expense?.total || 0,
            totalIncome: income?.total || 0,
            categoryBreakdown: categoryStats,
          };
        },
      };
    }
  }
  return dbModule;
}

export async function insertRecord(record: Record): Promise<void> {
  const mod = await getModule();
  return mod.insertRecord(record);
}

export async function getRecordsByDate(date: string): Promise<Record[]> {
  const mod = await getModule();
  return mod.getRecordsByDate(date);
}

export async function getRecordsByMonth(month: string): Promise<Record[]> {
  const mod = await getModule();
  return mod.getRecordsByMonth(month);
}

export async function deleteRecord(id: string): Promise<void> {
  const mod = await getModule();
  return mod.deleteRecord(id);
}

export async function getMonthlyStats(month: string) {
  const mod = await getModule();
  return mod.getMonthlyStats(month);
}
