import type { HouseholdReadiness } from "../../types/household";
import { createUuid } from "../../utils/ids";
import type { SQLiteDatabase } from "../connection";

export async function saveHouseholdSnapshot(
	db: SQLiteDatabase,
	caseId: string,
	readiness: HouseholdReadiness,
) {
	const id = createUuid();
	const now = Date.now();
	await db.runAsync(
		`INSERT INTO household_snapshots (
      id, case_id, timestamp, has_thermometer, has_oximeter, 
      transport_available, pharmacy_distance_km, overnight_caregiver, medicine_stock
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			id,
			caseId,
			now,
			readiness.has_thermometer ? 1 : 0,
			readiness.has_oximeter ? 1 : 0,
			readiness.transport_available ? 1 : 0,
			readiness.pharmacy_distance_km,
			readiness.overnight_caregiver ? 1 : 0,
			readiness.medicine_stock ? 1 : 0,
		],
	);
	return { id, case_id: caseId, timestamp: now, ...readiness };
}

interface HouseholdRow {
	has_thermometer: number;
	has_oximeter: number;
	transport_available: number;
	pharmacy_distance_km: number;
	overnight_caregiver: number;
	medicine_stock: number;
}

export async function getLatestHouseholdSnapshot(
	db: SQLiteDatabase,
	caseId: string,
): Promise<HouseholdReadiness | null> {
	const row = await db.getFirstAsync<HouseholdRow>(
		"SELECT * FROM household_snapshots WHERE case_id = ? ORDER BY timestamp DESC LIMIT 1",
		[caseId],
	);
	if (!row) return null;
	return {
		has_thermometer: row.has_thermometer === 1,
		has_oximeter: row.has_oximeter === 1,
		transport_available: row.transport_available === 1,
		pharmacy_distance_km: row.pharmacy_distance_km,
		overnight_caregiver: row.overnight_caregiver === 1,
		medicine_stock: row.medicine_stock === 1,
	};
}
