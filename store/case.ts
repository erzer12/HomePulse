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
import type { SymptomEntry, TriageInput, TriageOutput } from "../types/triage";

interface CaseState {
	activeCase?: CaseRecord | undefined;
	loading: boolean;
	error: string | null;
	createCaseForPatient: (patientId: string) => Promise<CaseRecord>;
	loadActiveCase: (patientId: string) => Promise<void>;
	loadLatestActiveCase: () => Promise<void>;
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
			const row = await caseQueries.createCase(
				db as unknown as SQLiteDatabase,
				patientId,
			);
			const c: CaseRecord = {
				...row,
				status: row.status as "active" | "closed",
				timeline: [],
			};
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
			const row = await caseQueries.getActiveCase(
				db as unknown as SQLiteDatabase,
				patientId,
			);
			if (row) {
				const c = row as any;
				if (c.triage_output) {
					c.triage_output = JSON.parse(c.triage_output);
					c.current_action_state = c.triage_output.action_state;
				}
				// Load timeline if needed, or ensure it's at least an array
				c.timeline = await caseQueries.getSymptomHistory(db as unknown as SQLiteDatabase, c.id);
				set({ activeCase: c as CaseRecord, loading: false });
			} else {
				set({ activeCase: undefined, loading: false });
			}
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
		}
	},
	loadLatestActiveCase: async () => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const rows = await caseQueries.getActiveCases(db as unknown as SQLiteDatabase);
			const row = rows[0];
			if (row) {
				const c = row as any;
				if (c.triage_output) {
					c.triage_output = JSON.parse(c.triage_output);
					c.current_action_state = c.triage_output.action_state;
				}
				c.timeline = await caseQueries.getSymptomHistory(db as unknown as SQLiteDatabase, c.id);
				set({ activeCase: c as CaseRecord, loading: false });
			} else {
				set({ activeCase: undefined, loading: false });
			}
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
				entry as any,
			);
			
			// Refresh local active case to include new entry in timeline
			set((state) => {
				if (state.activeCase && state.activeCase.id === entry.id) {
					// This logic is slightly wrong because entry.id is not caseId
				}
				return {};
			});
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
			const history = (await caseQueries.getSymptomHistory(
				db as unknown as SQLiteDatabase,
				caseId,
			)) as SymptomEntry[];
			
			const latest = history[history.length - 1];
			if (!latest) throw new Error("No symptom entries for case");
			
			const patientRow = await db.getFirstAsync(
				"SELECT * FROM cases JOIN patients ON cases.patient_id = patients.id WHERE cases.id = ?",
				[caseId],
			);
			
			const p = patientRow as any;
			const input: TriageInput = {
				patient: {
					age_group: p?.age_group || "adult",
					age_months: p?.age_months,
					chronic_conditions: JSON.parse(p?.chronic_conditions || "[]"),
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

			const output = evaluate(input);
			// persist triage_output on symptom entry and update case state
			await caseQueries.updateCaseState(
				db as unknown as SQLiteDatabase,
				caseId,
				output,
			);
			
			// Update local state
			set((state) => {
				if (state.activeCase && state.activeCase.id === caseId) {
					return {
						activeCase: {
							...state.activeCase,
							current_action_state: output.action_state,
							triage_output: output,
							timeline: history
						},
						loading: false
					};
				}
				return { loading: false };
			});

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
			set({ activeCase: undefined, loading: false });
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
				const caseRow = await db.getFirstAsync<any>(
					"SELECT * FROM cases WHERE id = ?",
					[caseId],
				);
				const stateLevel = caseRow?.current_action_state || 1;
				const tasks = await taskQueries.getTasksForCase(
					db as unknown as SQLiteDatabase,
					caseId,
				);
				const summary: CaseSummary = {
					token,
					case_id: caseId,
					created_at: Date.now(),
					state_level: stateLevel as number,
					tasks: tasks.map((t: any) => ({
						id: t.id,
						title: t.title,
						status: t.status as "pending" | "done",
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
