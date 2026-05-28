import type { SQLiteDatabase } from 'expo-sqlite';
import { initDatabase } from '../schema';

export async function runInitialMigration(db: SQLiteDatabase): Promise<void> {
  await initDatabase(db);
}
