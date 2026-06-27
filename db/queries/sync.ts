import type { SQLiteDatabase } from "expo-sqlite";

export type SyncRow = {
	id: string;
	entity_type: string;
	entity_id: string;
	operation: string;
	payload: string; // JSON string
	idempotency_key: string | null;
	retry_count: number;
	max_retries: number;
	last_error: string | null;
	priority: number;
	created_at: number;
	synced_at: number | null;
};

/** All items not yet exceeded max_retries, ordered by priority then age. */
export async function getPendingItems(
	db: SQLiteDatabase,
	limit = 50,
): Promise<SyncRow[]> {
	return db.getAllAsync<SyncRow>(
		`SELECT * FROM sync_queue
     WHERE retry_count < max_retries
     ORDER BY priority ASC, created_at ASC
     LIMIT ?`,
		[limit],
	);
}

/** Count of actionable (non-exhausted) queue items. */
export async function getPendingCount(db: SQLiteDatabase): Promise<number> {
	const result = await db.getFirstAsync<{ count: number }>(
		"SELECT COUNT(*) as count FROM sync_queue WHERE retry_count < max_retries",
	);
	return result?.count ?? 0;
}

/** Count of permanently failed items (retry_count >= max_retries). */
export async function getFailedCount(db: SQLiteDatabase): Promise<number> {
	const result = await db.getFirstAsync<{ count: number }>(
		"SELECT COUNT(*) as count FROM sync_queue WHERE retry_count >= max_retries",
	);
	return result?.count ?? 0;
}

/** Mark an item as successfully synced and remove it. */
export async function dequeueItem(
	db: SQLiteDatabase,
	id: string,
): Promise<void> {
	await db.runAsync("DELETE FROM sync_queue WHERE id = ?", [id]);
}

/** Record a failure: increment retry_count and store last_error. */
export async function recordFailure(
	db: SQLiteDatabase,
	id: string,
	error: string,
): Promise<void> {
	await db.runAsync(
		"UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?",
		[error, id],
	);
}

/** Remove all items that have permanently failed (exceeded max_retries). */
export async function purgeFailedItems(db: SQLiteDatabase): Promise<void> {
	await db.runAsync("DELETE FROM sync_queue WHERE retry_count >= max_retries");
}

/** Remove all items for a specific entity (e.g., when a case is deleted). */
export async function removeItemsForEntity(
	db: SQLiteDatabase,
	entityId: string,
): Promise<void> {
	await db.runAsync("DELETE FROM sync_queue WHERE entity_id = ?", [entityId]);
}
