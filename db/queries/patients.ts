import type { SQLiteBindValue } from "expo-sqlite";
import { createUuid } from "../../utils/ids";
import type { PatientInput, PatientUpdateInput } from "../../types/patient";
import type { SQLiteDatabase } from "../connection";

type PatientRow = {
	id: string;
	name: string;
	age_group: string;
	age_months: number | null;
	chronic_conditions: string;
	allergies: string;
	medications: string;
	emergency_contact_name: string | null;
	emergency_contact_phone: string | null;
	created_at: number;
	updated_at: number;
};

function parseList(value: string | null | undefined) {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function mapPatientRow(row: PatientRow) {
	return {
		...row,
		chronic_conditions: parseList(row.chronic_conditions),
		allergies: parseList(row.allergies),
		medications: parseList(row.medications),
	};
}

export async function getPatients(db: SQLiteDatabase) {
	const rows = await db.getAllAsync<PatientRow>(
		"SELECT * FROM patients ORDER BY updated_at DESC",
	);
	return rows.map(mapPatientRow);
}

export async function createPatient(db: SQLiteDatabase, data: PatientInput) {
	const id = createUuid();
	const now = Date.now();
	await db.runAsync(
		`INSERT INTO patients (id, name, age_group, age_months, chronic_conditions, allergies, medications, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			id,
			data.name || "",
			data.age_group || "adult",
			data.age_months ?? null,
			JSON.stringify(data.chronic_conditions || []),
			JSON.stringify(data.allergies || []),
			JSON.stringify(data.medications || []),
			data.emergency_contact_name || null,
			data.emergency_contact_phone || null,
			now,
			now,
		],
	);
	return { id, ...data, created_at: now, updated_at: now };
}

export async function getPatient(db: SQLiteDatabase, id: string) {
	const row = await db.getFirstAsync<PatientRow>(
		"SELECT * FROM patients WHERE id = ? LIMIT 1",
		[id],
	);
	return row ? mapPatientRow(row) : null;
}

export async function updatePatient(
	db: SQLiteDatabase,
	id: string,
	data: PatientUpdateInput,
) {
	const now = Date.now();
	const fields: string[] = [];
	const values: SQLiteBindValue[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.age_group !== undefined) {
		fields.push("age_group = ?");
		values.push(data.age_group);
	}
	if (data.age_months !== undefined) {
		fields.push("age_months = ?");
		values.push(data.age_months);
	}
	if (data.chronic_conditions !== undefined) {
		fields.push("chronic_conditions = ?");
		values.push(JSON.stringify(data.chronic_conditions));
	}
	if (data.allergies !== undefined) {
		fields.push("allergies = ?");
		values.push(JSON.stringify(data.allergies));
	}
	if (data.medications !== undefined) {
		fields.push("medications = ?");
		values.push(JSON.stringify(data.medications));
	}
	if (data.emergency_contact_name !== undefined) {
		fields.push("emergency_contact_name = ?");
		values.push(data.emergency_contact_name);
	}
	if (data.emergency_contact_phone !== undefined) {
		fields.push("emergency_contact_phone = ?");
		values.push(data.emergency_contact_phone);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = ?");
	values.push(now);
	values.push(id);
	await db.runAsync(
		`UPDATE patients SET ${fields.join(", ")} WHERE id = ?`,
		values,
	);
}

export async function deletePatient(db: SQLiteDatabase, id: string) {
	await db.runAsync("DELETE FROM patients WHERE id = ?", [id]);
}
