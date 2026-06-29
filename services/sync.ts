import { getDb } from "@/db/connection";
import { useSyncStore } from "../store/sync";
import { createCompactId } from "../utils/ids";
import type { CaseSummary } from "./supabase";
import { publishCaseSummary, updateTaskStatus } from "./supabase";
import { revokeAllTokensForCase } from "./token";

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

	if (idempotency_key) {
		const existing = await db.getFirstAsync<{ id: string }>(
			"SELECT id FROM sync_queue WHERE idempotency_key = ?",
			[idempotency_key],
		);
		if (existing) {
			// Deduplicate: already enqueued
			return;
		}
	}

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

	// Refresh pending count
	useSyncStore.getState().checkPending();
}

export async function flushSyncQueue(limit = 50) {
	const db = await getDb();
	const rows: SyncRow[] = await db.getAllAsync(
		`SELECT * FROM sync_queue WHERE retry_count < max_retries ORDER BY priority ASC, created_at ASC LIMIT ?`,
		[limit],
	);

	if (rows.length === 0) return;

	const { setSyncing, checkPending, setError } = useSyncStore.getState();
	setSyncing(true);

	let hadError = false;
	for (const row of rows) {
		try {
			const payload = JSON.parse(row.payload);
			if (row.entity_type === "case_summary" && row.operation === "publish") {
				await publishCaseSummary(payload as CaseSummary);
			} else if (
				row.entity_type === "case_summary" &&
				row.operation === "revoke_all"
			) {
				await revokeAllTokensForCase(row.entity_id);
			} else if (
				row.entity_type === "task" &&
				row.operation === "update_status"
			) {
				await updateTaskStatus(
					payload.id as string,
					payload.status as "pending" | "done",
					payload.completed_at as number | undefined,
				);
			} else {
				throw new Error(
					`unknown sync operation: ${row.entity_type}:${row.operation}`,
				);
			}

			// success -> delete
			await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [row.id]);
		} catch (err: unknown) {
			hadError = true;
			const lastError = err instanceof Error ? err.message : String(err);
			const nextRetry = (row.retry_count || 0) + 1;
			await db.runAsync(
				`UPDATE sync_queue SET retry_count = ?, last_error = ? WHERE id = ?`,
				[nextRetry, lastError, row.id],
			);
			setError(lastError);
		}
	}

	// Clear the error banner once all processed rows succeeded
	if (!hadError) {
		setError(null);
	}

	await checkPending();
	setSyncing(false);
}
