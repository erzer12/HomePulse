import { create } from "zustand";
import { getDb } from "../db/connection";

interface SyncState {
	pendingCount: number;
	isSyncing: boolean;
	error: string | null;
	checkPending: () => Promise<number>;
	checkPendingForCase: (caseId: string) => Promise<number>;
	setSyncing: (isSyncing: boolean) => void;
	setError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
	pendingCount: 0,
	isSyncing: false,
	error: null,
	checkPending: async () => {
		try {
			const db = await getDb();
			const result = await db.getFirstAsync<{ count: number }>(
				"SELECT COUNT(*) as count FROM sync_queue WHERE retry_count < max_retries",
			);
			const count = result?.count || 0;
			set({ pendingCount: count });
			return count;
		} catch (e) {
			console.error("SyncStore checkPending error:", e);
			return 0;
		}
	},
	checkPendingForCase: async (caseId: string) => {
		try {
			const db = await getDb();
			const result = await db.getFirstAsync<{ count: number }>(
				`SELECT COUNT(*) as count
				 FROM sync_queue sq
				 LEFT JOIN caregiver_tasks ct ON sq.entity_id = ct.id AND sq.entity_type = 'task'
				 WHERE sq.retry_count < sq.max_retries
				   AND (
				     (sq.entity_type = 'case_summary' AND sq.entity_id = ?)
				     OR (sq.entity_type = 'task' AND ct.case_id = ?)
				   )`,
				[caseId, caseId],
			);
			return result?.count || 0;
		} catch (e) {
			console.error("SyncStore checkPendingForCase error:", e);
			return 0;
		}
	},
	setSyncing: (isSyncing) => set({ isSyncing }),
	setError: (error) => set({ error }),
}));
