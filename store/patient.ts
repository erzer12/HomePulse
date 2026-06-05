import { create } from "zustand";
import type { SQLiteDatabase } from "../db/connection";
import { getDb } from "../db/connection";
import {
	createPatient as dbCreatePatient,
	deletePatient as dbDeletePatient,
	getPatient as dbGetPatient,
	updatePatient as dbUpdatePatient,
	getPatients,
} from "../db/queries/patients";
import type {
	Patient,
	PatientInput,
	PatientUpdateInput,
} from "../types/patient";

interface PatientState {
	profiles: Patient[];
	loading: boolean;
	error: string | null;
	loadPatients: () => Promise<void>;
	createPatient: (data: PatientInput) => Promise<Patient>;
	getPatient: (id: string) => Promise<Patient | null>;
	updatePatient: (id: string, data: PatientUpdateInput) => Promise<void>;
	deletePatient: (id: string) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, _get) => ({
	profiles: [],
	loading: false,
	error: null,
	loadPatients: async () => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const rows = await getPatients(db as unknown as SQLiteDatabase);
			set({ profiles: rows, loading: false });
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
		}
	},
	createPatient: async (data) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const p = await dbCreatePatient(
				db as unknown as SQLiteDatabase,
				data as PatientInput,
			);
			const patient: Patient = {
				...p,
				age_months: p.age_months ?? null,
				chronic_conditions: p.chronic_conditions || [],
				allergies: p.allergies || [],
				medications: p.medications || [],
				emergency_contact_name: p.emergency_contact_name ?? null,
				emergency_contact_phone: p.emergency_contact_phone ?? null,
			};
			set((s) => ({ profiles: [...s.profiles, patient], loading: false }));
			return patient;
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	getPatient: async (id) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			const p = await dbGetPatient(db as unknown as SQLiteDatabase, id);
			set({ loading: false });
			return p;
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			return null;
		}
	},
	updatePatient: async (id, data) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			await dbUpdatePatient(
				db as unknown as SQLiteDatabase,
				id,
				data as PatientUpdateInput,
			);
			// reload profiles
			const rows = await getPatients(db as unknown as SQLiteDatabase);
			set({ profiles: rows, loading: false });
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
	deletePatient: async (id) => {
		set({ loading: true, error: null });
		try {
			const db = await getDb();
			await dbDeletePatient(db as unknown as SQLiteDatabase, id);
			const rows = await getPatients(db as unknown as SQLiteDatabase);
			set({ profiles: rows, loading: false });
		} catch (e: unknown) {
			set({
				error: e instanceof Error ? e.message : String(e),
				loading: false,
			});
			throw e;
		}
	},
}));
