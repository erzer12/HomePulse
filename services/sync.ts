import { getDb } from "@/db/connection";
import { createCompactId } from "../utils/ids";
import type { CaseSummary } from "./supabase";
import { publishCaseSummary, updateTaskStatus } from "./supabase";

type SyncRow = {
	id: string;
	entity_type: string;
	entity_id: string;
	operation: string;
	payload: string; // JSON
	idempotency_key: string | null;
	retry_count: number;
	max_retries: number;
	last_error: string | null;
	priority: number;
	created_at: number;
	synced_at: number | null;
};

export async function enqueueSyncOperation(
	entityType: string,
	entityId: string,
	operation: string,
	payload: unknown,
	opts?: { idempotencyKey?: string; maxRetries?: number; priority?: number },
) {
	const db = await getDb();
	const idempotency_key = opts?.idempotencyKey ?? null;
	const max_retries = opts?.maxRetries ?? 5;
	const priority = opts?.priority ?? 0;
	const payloadStr = JSON.stringify(payload);
	const id = createCompactId();

	await db.runAsync(
		`INSERT INTO sync_queue (
			id, entity_type, entity_id, operation, payload, 
			idempotency_key, retry_count, max_retries, priority, created_at
		) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
		[
			id,
			entityType,
			entityId,
			operation,
			payloadStr,
			idempotency_key,
			max_retries,
			priority,
			Date.now(),
		],
	);
}

export async function flushSyncQueue(limit = 50) {
	const db = await getDb();
	const rows: SyncRow[] = await db.getAllAsync(
		`SELECT * FROM sync_queue WHERE retry_count < max_retries ORDER BY priority ASC, created_at ASC LIMIT ?`,
		[limit],
	);

	for (const row of rows) {
		try {
			const payload = JSON.parse(row.payload);
			if (row.entity_type === "case_summary" && row.operation === "publish") {
				await publishCaseSummary(payload as CaseSummary);
			} else if (
				row.entity_type === "task" &&
				row.operation === "update_status"
			) {
				await updateTaskStatus(
					payload.id as string,
					payload.status as "pending" | "done",
				);
			} else {
				throw new Error(
					`unknown sync operation: ${row.entity_type}:${row.operation}`,
				);
			}

			// success -> delete
			await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [row.id]);
		} catch (err: unknown) {
			const lastError = err instanceof Error ? err.message : String(err);
			const nextRetry = (row.retry_count || 0) + 1;
			await db.runAsync(
				`UPDATE sync_queue SET retry_count = ?, last_error = ? WHERE id = ?`,
				[nextRetry, lastError, row.id],
			);
		}
	}
}
