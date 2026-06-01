import * as SQLite from "expo-sqlite";

type ExecResult = { insertId?: number; rows?: { _array: unknown[] } };

// Minimal local shape for the underlying WebSQL-like DB returned by expo-sqlite
interface RawWebSQLDatabase {
	transaction: (
		cb: (tx: {
			executeSql: (
				sql: string,
				params?: unknown[],
				success?: (tx: unknown, result: ExecResult) => void,
				error?: (tx: unknown, err: unknown) => boolean,
			) => void;
		}) => void,
	) => void;
	exec?: (
		stmts: { sql: string; args?: unknown[] }[],
		readOnly?: boolean,
		cb?: () => void,
	) => void;
}

export type SQLiteDatabase = RawWebSQLDatabase & {
	runAsync: (sql: string, params?: unknown[]) => Promise<ExecResult>;
	getAllAsync: <_T = unknown>(sql: string, params?: unknown[]) => Promise<_T[]>;
	getFirstAsync: <_T = unknown>(
		sql: string,
		params?: unknown[],
	) => Promise<_T | null>;
	execAsync: (sql: string) => Promise<void>;
};

let _db: SQLiteDatabase | null = null;

function wrap(db: RawWebSQLDatabase): SQLiteDatabase {
	const runAsync = (sql: string, params: unknown[] = []) =>
		new Promise<ExecResult>((resolve, reject) => {
			db.transaction((tx) => {
				tx.executeSql(
					sql,
					params,
					(_tx, result) => resolve(result as ExecResult),
					(_tx, err) => {
						reject(err);
						return false;
					},
				);
			});
		});

	const getAllAsync = async <_T = unknown>(
		sql: string,
		params: unknown[] = [],
	): Promise<_T[]> => {
		const res = await runAsync(sql, params);
		return (res.rows as { _array?: _T[] } | undefined)?._array || [];
	};

	const getFirstAsync = async <_T = unknown>(
		sql: string,
		params: unknown[] = [],
	) => {
		const all = await getAllAsync<_T>(sql, params);
		return all.length ? all[0] : null;
	};

	const execAsync = async (sql: string) => {
		return new Promise<void>((resolve, reject) => {
			if (db.exec) {
				db.exec([{ sql, args: [] }], false, () => resolve());
				return;
			}
			// Fallback: run in a transaction
			db.transaction((tx) => {
				tx.executeSql(
					sql,
					[],
					() => resolve(),
					(_tx, err) => {
						reject(err);
						return false;
					},
				);
			});
		});
	};

	return Object.assign(db, { runAsync, getAllAsync, getFirstAsync, execAsync });
}

export async function getDb(): Promise<SQLiteDatabase> {
	if (_db) return _db;

	// Installed expo-sqlite typings may expose `openDatabaseSync`; prefer that to match types.
	// Use the sync initializer which returns a WebSQL-like DB object.
	const sqliteTyped = SQLite as unknown as {
		openDatabaseSync?: (name: string) => RawWebSQLDatabase;
		openDatabase?: (name: string) => RawWebSQLDatabase;
	};
	const raw = sqliteTyped.openDatabaseSync
		? sqliteTyped.openDatabaseSync("homepulse.db")
		: sqliteTyped.openDatabase
			? sqliteTyped.openDatabase("homepulse.db")
			: (undefined as unknown as RawWebSQLDatabase);
	_db = wrap(raw as RawWebSQLDatabase);
	return _db;
}

export function closeDb(): void {
	// expo-sqlite has no close; keep for API completeness
	_db = null;
}
