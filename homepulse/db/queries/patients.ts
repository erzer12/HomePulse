import type { SQLiteDatabase } from 'expo-sqlite';

export async function getPatients(db: SQLiteDatabase) {
  return db.getAllAsync('SELECT * FROM patients ORDER BY updated_at DESC');
}
