import * as SQLite from "expo-sqlite";
import { initDatabase } from "./schema";

export type SQLiteDatabase = SQLite.SQLiteDatabase;

let _db: SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
	if (_db) return _db;

	const db = await SQLite.openDatabaseAsync("homepulse.db");
	await initDatabase(db);
	_db = db;
	return _db;
}

export async function closeDb(): Promise<void> {
	if (_db) {
		await _db.closeAsync();
	}
	_db = null;
}

export async function truncateDatabase(): Promise<void> {
	const db = await getDb();
	await db.execAsync(`
		DELETE FROM sync_queue;
		DELETE FROM caregiver_tasks;
		DELETE FROM household_snapshots;
		DELETE FROM symptom_entries;
		DELETE FROM cases;
		DELETE FROM patients;
		VACUUM;
	`);
}
