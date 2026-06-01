import { v4 as uuidv4 } from "uuid";
import type { SymptomEntryType, TriageOutputType } from "../../types";
import type { SQLiteDatabase } from "../connection";

export async function getActiveCases(db: SQLiteDatabase) {
	return db.getAllAsync(
		"SELECT * FROM cases WHERE status = 'active' ORDER BY started_at DESC",
	);
}

export async function createCase(db: SQLiteDatabase, patientId: string) {
	const id = uuidv4();
	const now = Date.now();
	await db.runAsync(
		`INSERT INTO cases (id, patient_id, status, started_at) VALUES (?, ?, 'active', ?)`,
		[id, patientId, now],
	);
	return { id, patient_id: patientId, status: "active", started_at: now };
}

export async function getActiveCase(db: SQLiteDatabase, patientId: string) {
	return db.getFirstAsync(
		"SELECT * FROM cases WHERE patient_id = ? AND status = 'active' LIMIT 1",
		[patientId],
	);
}

export async function appendSymptomEntry(
	db: SQLiteDatabase,
	entry: SymptomEntryType & {
		raw_inputs?: Record<string, unknown>;
		triage_output?: TriageOutputType | null;
	},
) {
	await db.runAsync(
		`INSERT INTO symptom_entries (id, case_id, timestamp, category, duration_hours, temperature_celsius, spo2_percent, hydration_status, consciousness, breathing_difficulty, raw_inputs, triage_output) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			entry.id || uuidv4(),
			entry.case_id,
			entry.timestamp,
			entry.category,
			entry.duration_hours,
			entry.temperature_celsius ?? null,
			entry.spo2_percent ?? null,
			entry.hydration_status,
			entry.consciousness,
			entry.breathing_difficulty ? 1 : 0,
			JSON.stringify(entry.raw_inputs || {}),
			entry.triage_output ? JSON.stringify(entry.triage_output) : null,
		],
	);
}

export async function getSymptomHistory(db: SQLiteDatabase, caseId: string) {
	return db.getAllAsync(
		"SELECT * FROM symptom_entries WHERE case_id = ? ORDER BY timestamp ASC",
		[caseId],
	);
}

export async function updateCaseState(
	db: SQLiteDatabase,
	caseId: string,
	triageOutput: TriageOutputType,
) {
	await db.runAsync(
		`UPDATE cases SET current_action_state = ?, last_evaluated_at = ? WHERE id = ?`,
		[triageOutput.action_state.level, Date.now(), caseId],
	);
}

export async function closeCase(db: SQLiteDatabase, caseId: string) {
	await db.runAsync(`UPDATE cases SET status = 'closed' WHERE id = ?`, [
		caseId,
	]);
}

export async function setShareToken(
	db: SQLiteDatabase,
	caseId: string,
	token: string,
) {
	await db.runAsync(`UPDATE cases SET share_token = ? WHERE id = ?`, [
		token,
		caseId,
	]);
}
