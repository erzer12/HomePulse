import { create } from "zustand";
import type { SQLiteDatabase } from "../db/connection";
import { getDb } from "../db/connection";
import * as caseQueries from "../db/queries/cases";
import * as taskQueries from "../db/queries/tasks";
import { evaluate } from "../engine";
import { generateShareToken } from "../services/share";
import type { CaseSummary } from "../services/supabase";
import { publishCaseSummary } from "../services/supabase";
import { enqueueSyncOperation } from "../services/sync";
import type { CaseRecord } from "../types/case";
import type { SymptomEntry, TriageOutput } from "../types/triage";

interface CaseState {
	activeCase?: CaseRecord | undefined;
	loading: boolean;
	error: string | null;
	createCaseForPatient: (patientId: string) => Promise<CaseRecord>;
	loadActiveCase: (patientId: string) => Promise<void>;
	appendSymptomEntry: (entry: SymptomEntry) => Promise<void>;
	evaluateCase: (caseId: string) => Promise<TriageOutput>;
	closeCase: (caseId: string) => Promise<void>;
	setShareToken: (caseId: string) => Promise<string>;
}

export const useCaseStore = create<CaseState>((set, _get) => ({
	activeCase: undefined,
	loading: false,
	error: null,
	createCaseForPatient: async (patientId) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const c = await caseQueries.createCase(
				db as unknown as SQLiteDatabase,
				patientId,
			);
			set({ activeCase: c, loading: false });
			return c;
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	loadActiveCase: async (patientId) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const c = await caseQueries.getActiveCase(
				db as unknown as SQLiteDatabase,
				patientId,
			);
			set({ activeCase: c || undefined, loading: false });
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
		}
	},
	appendSymptomEntry: async (entry) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			await caseQueries.appendSymptomEntry(
				db as unknown as SQLiteDatabase,
				entry as SymptomEntry,
			);
			set({ loading: false });
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	evaluateCase: async (caseId) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const history = await caseQueries.getSymptomHistory(
				db as unknown as SQLiteDatabase,
				caseId,
			);
			const latest = history[history.length - 1];
			if (!latest) throw new Error("No symptom entries for case");
			const patientRow = await db.getFirstAsync(
				"SELECT * FROM cases JOIN patients ON cases.patient_id = patients.id WHERE cases.id = ?",
				[caseId],
			);
			const input = {
				patient: {
					age_group:
						(patientRow as unknown as Record<string, unknown>)?.age_group ||
						"adult",
					age_months: (patientRow as unknown as Record<string, unknown>)
						?.age_months,
					chronic_conditions: JSON.parse(
						(patientRow as unknown as Record<string, unknown>)
							?.chronic_conditions || "[]",
					),
				},
				symptom: latest,
				symptom_history: history.slice(0, -1),
				household: (await db.getFirstAsync(
					"SELECT * FROM household_snapshots WHERE case_id = ? ORDER BY timestamp DESC LIMIT 1",
					[caseId],
				)) || {
					has_thermometer: false,
					has_oximeter: false,
					transport_available: true,
					pharmacy_distance_km: 0,
					overnight_caregiver: true,
					medicine_stock: false,
				},
			};

			const output = evaluate(input as any);
			// persist triage_output on symptom entry and update case state
			await caseQueries.updateCaseState(
				db as unknown as SQLiteDatabase,
				caseId,
				output as TriageOutput,
			);
			set({ loading: false });
			return output;
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	closeCase: async (caseId) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			await caseQueries.closeCase(db as unknown as SQLiteDatabase, caseId);
			set({ loading: false });
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	setShareToken: async (caseId) => {
		set({ loading: true, error: null });
		try {
			const token = generateShareToken();
			const db = await getDb();
			await caseQueries.setShareToken(
				db as unknown as SQLiteDatabase,
				caseId,
				token,
			);
			set({ loading: false });

			// Attempt to publish a case summary to Supabase; on failure enqueue for retry
			try {
				const caseRow = await db.getFirstAsync<Record<string, unknown>>(
					"SELECT * FROM cases WHERE id = ?",
					[caseId],
				);
				const stateLevel =
					(caseRow as Record<string, unknown>)?.current_action_state || 1;
				const tasks = await taskQueries.getTasksForCase(
					db as unknown as SQLiteDatabase,
					caseId,
				);
				const summary: CaseSummary = {
					token,
					case_id: caseId,
					created_at: Date.now(),
					state_level: stateLevel,
					tasks: tasks.map((t) => ({
						id: t.id,
						title: t.title,
						status: t.status,
					})),
				};
				await publishCaseSummary(summary);
			} catch (_err: unknown) {
				// enqueue for background retry
				await enqueueSyncOperation(
					"case_summary",
					caseId,
					"publish",
					{ caseId, token },
					{ idempotencyKey: token },
				);
			}

			return token;
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
}));
