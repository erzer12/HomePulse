import type { SQLiteDatabase } from "expo-sqlite";
import { createCompactId } from "../../utils/ids";

export async function getTasksForCase(db: SQLiteDatabase, caseId: string) {
	return db.getAllAsync(
		"SELECT * FROM caregiver_tasks WHERE case_id = ? ORDER BY created_at DESC",
		[caseId],
	);
}

export async function createTask(
	db: SQLiteDatabase,
	caseId: string,
	title: string,
	description?: string,
) {
	const id = createCompactId();
	const now = Date.now();
	await db.runAsync(
		`INSERT INTO caregiver_tasks (id, case_id, title, description, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)`,
		[id, caseId, title, description || null, now],
	);
	return {
		id,
		case_id: caseId,
		title,
		description: description || null,
		status: "pending",
		created_at: now,
	};
}

export async function updateTaskStatus(
	db: SQLiteDatabase,
	taskId: string,
	status: "pending" | "done",
) {
	const completed_at = status === "done" ? Date.now() : null;
	await db.runAsync(
		`UPDATE caregiver_tasks SET status = ?, completed_at = ? WHERE id = ?`,
		[status, completed_at, taskId],
	);
}
