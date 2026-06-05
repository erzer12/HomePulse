import type { AgeGroup } from "./triage";

export interface Patient {
	id: string;
	name: string;
	age_group: AgeGroup;
	age_months: number | null;
	chronic_conditions: string[];
	allergies: string[];
	medications: string[];
	emergency_contact_name: string | null;
	emergency_contact_phone: string | null;
	created_at: number;
	updated_at: number;
}

export interface PatientInput {
	name: string;
	age_group: AgeGroup;
	age_months?: number;
	chronic_conditions: string[];
	allergies?: string[];
	medications?: string[];
	emergency_contact_name?: string | null;
	emergency_contact_phone?: string | null;
}

export type PatientUpdateInput = Partial<PatientInput>;

export type ChronicCondition = string;
