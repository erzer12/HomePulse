import { create } from "zustand";
import type { SQLiteDatabase } from "../db/connection";
import { getDb } from "../db/connection";
import * as caseQueries from "../db/queries/cases";
import { getLatestHouseholdSnapshot } from "../db/queries/household";
import * as taskQueries from "../db/queries/tasks";
import { evaluate } from "../engine";
import {
	cancelNotificationsForCase,
	scheduleRecheckNotification,
} from "../services/notifications";
import { generateShareToken } from "../services/share";
import type { CaseSummary } from "../services/supabase";
import { publishCaseSummary } from "../services/supabase";
import { enqueueSyncOperation, flushSyncQueue } from "../services/sync";
import { resolveExpiryMs } from "../services/token";
import type { CaseRecord } from "../types/case";
import type {
	AgeGroup,
	HouseholdReadiness,
	SymptomEntry,
	TriageInput,
	TriageOutput,
} from "../types/triage";
import { useHouseholdStore } from "./household";

interface CaseState {
	activeCase?: CaseRecord | undefined;
	activeCases: CaseRecord[];
	loading: boolean;
	error: string | null;
	createCaseForPatient: (patientId: string) => Promise<CaseRecord>;
	loadActiveCase: (patientId: string) => Promise<void>;
	loadLatestActiveCase: () => Promise<void>;
	loadActiveCases: () => Promise<void>;
	selectActiveCase: (caseId: string) => Promise<void>;
	appendSymptomEntry: (entry: SymptomEntry) => Promise<void>;
	evaluateCase: (caseId: string) => Promise<TriageOutput>;
	closeCase: (caseId: string) => Promise<void>;
	setShareToken: (
		caseId: string,
		expiryOption?: "6h" | "24h" | "48h" | "until_resolved",
	) => Promise<string>;
}

export const useCaseStore = create<CaseState>((set, _get) => ({
	activeCase: undefined,
	activeCases: [],
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
			const rawRow = (await caseQueries.getActiveCase(
				db as unknown as SQLiteDatabase,
				patientId,
			)) as Record<string, unknown> | null;
			if (rawRow) {
				const c = rawRow as unknown as CaseRecord;
				if (rawRow.triage_output) {
					c.triage_output = JSON.parse(rawRow.triage_output as string);
					c.current_action_state = c.triage_output?.action_state;
				}
				// Load timeline
				c.timeline = (await caseQueries.getSymptomHistory(
					db as unknown as SQLiteDatabase,
					c.id,
				)) as SymptomEntry[];
				// Hydrate the household store from the latest DB snapshot
				const hhRow = await db.getFirstAsync<HouseholdReadiness>(
					"SELECT * FROM household_snapshots WHERE case_id = ? ORDER BY timestamp DESC LIMIT 1",
					[c.id],
				);
				if (hhRow) {
					useHouseholdStore.getState().setReadiness(hhRow);
				}
				set({ activeCase: c, loading: false });
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
			const rows = (await caseQueries.getActiveCases(
				db as unknown as SQLiteDatabase,
			)) as Record<string, unknown>[];
			const rawRow = rows[0];
			if (rawRow) {
				const c = rawRow as unknown as CaseRecord;
				if (rawRow.triage_output) {
					c.triage_output = JSON.parse(rawRow.triage_output as string);
					c.current_action_state = c.triage_output?.action_state;
				}
				c.timeline = (await caseQueries.getSymptomHistory(
					db as unknown as SQLiteDatabase,
					c.id,
				)) as SymptomEntry[];
				// Hydrate the household store from the latest DB snapshot
				const hhRow = await db.getFirstAsync<HouseholdReadiness>(
					"SELECT * FROM household_snapshots WHERE case_id = ? ORDER BY timestamp DESC LIMIT 1",
					[c.id],
				);
				if (hhRow) {
					useHouseholdStore.getState().setReadiness(hhRow);
				}
				set({ activeCase: c, loading: false });
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
	loadActiveCases: async () => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const rows = (await caseQueries.getActiveCases(
				db as unknown as SQLiteDatabase,
			)) as Record<string, unknown>[];
			const cases: CaseRecord[] = [];
			for (const row of rows) {
				const c = row as unknown as CaseRecord;
				if (row.triage_output) {
					c.triage_output = JSON.parse(row.triage_output as string);
					c.current_action_state = c.triage_output?.action_state;
				}
				c.timeline = (await caseQueries.getSymptomHistory(
					db as unknown as SQLiteDatabase,
					c.id,
				)) as SymptomEntry[];
				cases.push(c);
			}
			set((state) => {
				// If the currently displayed case is no longer in the active list
				// (e.g., closed externally or on another device), promote the first
				// remaining case or clear to undefined to avoid a ghost-case state.
				const stillActive =
					state.activeCase && cases.some((c) => c.id === state.activeCase?.id);
				return {
					activeCases: cases,
					activeCase: stillActive ? state.activeCase : (cases[0] ?? undefined),
					loading: false,
				};
			});
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
		}
	},
	selectActiveCase: async (caseId) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const rawRow = await db.getFirstAsync<Record<string, unknown>>(
				"SELECT * FROM cases WHERE id = ? AND status = 'active'",
				[caseId],
			);
			if (rawRow) {
				const c = rawRow as unknown as CaseRecord;
				if (rawRow.triage_output) {
					c.triage_output = JSON.parse(rawRow.triage_output as string);
					c.current_action_state = c.triage_output?.action_state;
				}
				c.timeline = (await caseQueries.getSymptomHistory(
					db as unknown as SQLiteDatabase,
					c.id,
				)) as SymptomEntry[];
				const hhRow = await db.getFirstAsync<HouseholdReadiness>(
					"SELECT * FROM household_snapshots WHERE case_id = ? ORDER BY timestamp DESC LIMIT 1",
					[c.id],
				);
				if (hhRow) {
					useHouseholdStore.getState().setReadiness(hhRow);
				}
				set({ activeCase: c, loading: false });
			} else {
				set({ loading: false });
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
				entry,
			);

			// Refresh local active case to include new entry in timeline
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

			const patientRow = await db.getFirstAsync<{
				age_group: string;
				age_months: number | null;
				chronic_conditions: string;
			}>(
				"SELECT patients.age_group, patients.age_months, patients.chronic_conditions FROM cases JOIN patients ON cases.patient_id = patients.id WHERE cases.id = ?",
				[caseId],
			);

			const householdSnapshot = await getLatestHouseholdSnapshot(
				db as unknown as SQLiteDatabase,
				caseId,
			);

			const input: TriageInput = {
				patient: {
					age_group: (patientRow?.age_group || "adult") as AgeGroup,
					age_months: patientRow?.age_months ?? undefined,
					chronic_conditions: JSON.parse(
						patientRow?.chronic_conditions || "[]",
					),
				},
				symptom: latest,
				symptom_history: history.slice(0, -1),
				household: householdSnapshot || {
					has_thermometer: false,
					has_oximeter: false,
					transport_available: true,
					pharmacy_distance_km: 0,
					overnight_caregiver: true,
					medicine_stock: false,
				},
			};

			const output = evaluate(input);
			// Persist triage_output and update case state
			await caseQueries.updateCaseState(
				db as unknown as SQLiteDatabase,
				caseId,
				output,
			);

			// Schedule a recheck push notification if applicable
			const recheckMins = output.action_state.recheckIntervalMinutes;
			if (recheckMins > 0) {
				scheduleRecheckNotification(
					caseId,
					recheckMins,
					`Time to recheck — tap to assess the patient's current condition.`,
				).catch(() => {
					// Non-critical: notification scheduling failures are silent
				});
			}

			// Update local state
			set((state) => {
				if (state.activeCase && state.activeCase.id === caseId) {
					return {
						activeCase: {
							...state.activeCase,
							current_action_state: output.action_state,
							triage_output: output,
							timeline: history,
						},
						loading: false,
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
			// Cancel only this case's notifications — other active cases keep their alarms
			await cancelNotificationsForCase(caseId).catch(() => {});
			set((state) => ({
				activeCase: undefined,
				activeCases: state.activeCases.filter((c) => c.id !== caseId),
				loading: false,
			}));

			// Enqueue token revocation on Supabase and flush in background
			(async () => {
				try {
					await enqueueSyncOperation(
						"case_summary",
						caseId,
						"revoke_all",
						{ caseId },
						{ idempotencyKey: `revoke-${caseId}` },
					);
					await flushSyncQueue();
				} catch (err: unknown) {
					console.error("Failed to enqueue or flush case closure sync", err);
				}
			})();
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	setShareToken: async (caseId, expiryOption = "48h") => {
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

			const expiryMs = resolveExpiryMs(expiryOption);
			const expiresAt =
				expiryMs === Number.MAX_SAFE_INTEGER
					? Number.MAX_SAFE_INTEGER
					: Date.now() + expiryMs;

			// Attempt to publish a case summary to Supabase; on failure enqueue for retry
			try {
				const caseRow = await db.getFirstAsync<{
					current_action_state: number;
					patient_name: string;
				}>(
					"SELECT c.current_action_state, p.name as patient_name FROM cases c JOIN patients p ON c.patient_id = p.id WHERE c.id = ?",
					[caseId],
				);
				const stateLevel = caseRow?.current_action_state || 1;
				const patientName = caseRow?.patient_name || "Family Member";
				type TaskRow = { id: string; title: string; status: string };
				const tasks = (await taskQueries.getTasksForCase(
					db as unknown as SQLiteDatabase,
					caseId,
				)) as TaskRow[];
				const summary: CaseSummary = {
					token,
					case_id: caseId,
					created_at: Date.now(),
					state_level: stateLevel,
					patient_name: patientName,
					tasks: tasks.map((t) => ({
						id: t.id,
						title: t.title,
						status: t.status as "pending" | "done",
					})),
					expires_at: expiresAt,
				};
				await publishCaseSummary(summary);
			} catch (_err: unknown) {
				// Fix: enqueue the full summary payload (not just caseId+token)
				const caseRow = await db
					.getFirstAsync<{
						current_action_state: number;
						patient_name: string;
					}>(
						"SELECT c.current_action_state, p.name as patient_name FROM cases c JOIN patients p ON c.patient_id = p.id WHERE c.id = ?",
						[caseId],
					)
					.catch(() => null);
				const patientName = caseRow?.patient_name || "Family Member";
				type TaskRow = { id: string; title: string; status: string };
				const tasks = (await taskQueries
					.getTasksForCase(db as unknown as SQLiteDatabase, caseId)
					.catch(() => [])) as TaskRow[];
				const fallbackSummary: CaseSummary = {
					token,
					case_id: caseId,
					created_at: Date.now(),
					state_level: caseRow?.current_action_state || 1,
					patient_name: patientName,
					tasks: tasks.map((t) => ({
						id: t.id,
						title: t.title,
						status: t.status as "pending" | "done",
					})),
					expires_at: expiresAt,
				};
				await enqueueSyncOperation(
					"case_summary",
					caseId,
					"publish",
					fallbackSummary,
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
