import { create } from "zustand";
import type { SQLiteDatabase } from "@/db/connection";
import { getDb } from "@/db/connection";
import * as taskQueries from "@/db/queries/tasks";
import { updateTaskStatus as supabaseUpdateTaskStatus } from "@/services/supabase";
import { enqueueSyncOperation } from "@/services/sync";

interface TaskItem {
	id: string;
	case_id: string;
	title: string;
	description?: string | null;
	status: "pending" | "done";
	created_at: number;
	completed_at?: number | null;
}

interface TasksState {
	tasks: Record<string, TaskItem[]>;
	loading: boolean;
	error: string | null;
	loadTasksForCase: (caseId: string) => Promise<TaskItem[]>;
	createTask: (
		caseId: string,
		title: string,
		description?: string,
	) => Promise<TaskItem>;
	markDone: (taskId: string, caseId: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, _get) => ({
	tasks: {},
	loading: false,
	error: null,
	loadTasksForCase: async (caseId) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const rows = await taskQueries.getTasksForCase(
				db as unknown as SQLiteDatabase,
				caseId,
			);
			set((s) => ({ tasks: { ...s.tasks, [caseId]: rows }, loading: false }));
			return rows as TaskItem[];
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			return [];
		}
	},
	createTask: async (caseId, title, description) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const t = await taskQueries.createTask(
				db as unknown as SQLiteDatabase,
				caseId,
				title,
				description,
			);
			set((s) => ({
				tasks: { ...s.tasks, [caseId]: [t, ...(s.tasks[caseId] || [])] },
				loading: false,
			}));
			return t as TaskItem;
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	markDone: async (taskId, caseId) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			await taskQueries.updateTaskStatus(
				db as unknown as SQLiteDatabase,
				taskId,
				"done",
			);
			// optimistically update
			set((s) => ({
				tasks: {
					...s.tasks,
					[caseId]: (s.tasks[caseId] || []).map((t) =>
						t.id === taskId
							? { ...t, status: "done", completed_at: Date.now() }
							: t,
					),
				},
				loading: false,
			}));

			// Attempt server update; on failure enqueue for retry
			try {
				await supabaseUpdateTaskStatus(taskId, "done");
			} catch (_err: unknown) {
				await enqueueSyncOperation(
					"task",
					taskId,
					"update_status",
					{ id: taskId, status: "done" },
					{ idempotencyKey: taskId },
				);
			}
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
}));
