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
