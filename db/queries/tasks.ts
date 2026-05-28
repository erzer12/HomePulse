import type { SQLiteDatabase } from 'expo-sqlite';

export async function getTasksForCase(db: SQLiteDatabase, caseId: string) {
  return db.getAllAsync('SELECT * FROM caregiver_tasks WHERE case_id = ? ORDER BY created_at DESC', [caseId]);
}
