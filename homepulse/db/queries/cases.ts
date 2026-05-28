import type { SQLiteDatabase } from 'expo-sqlite';

export async function getActiveCases(db: SQLiteDatabase) {
  return db.getAllAsync("SELECT * FROM cases WHERE status = 'active' ORDER BY started_at DESC");
}
