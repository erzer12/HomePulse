import * as SQLite from "expo-sqlite";
import { initDatabase } from "./schema";

export type SQLiteDatabase = SQLite.SQLiteDatabase;

let _db: SQLiteDatabase | null = null;
let _initPromise: Promise<SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLiteDatabase> {
	if (_db) return Promise.resolve(_db);
	if (_initPromise) return _initPromise;

	_initPromise = (async () => {
		try {
			const db = await SQLite.openDatabaseAsync("homepulse.db");
			await initDatabase(db);
			_db = db;
			return db;
		} catch (error) {
			_initPromise = null; // reset to allow retries if it failed
			throw error;
		}
	})();

	return _initPromise;
}

export async function closeDb(): Promise<void> {
	if (_db) {
		await _db.closeAsync();
	}
	_db = null;
	_initPromise = null;
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
