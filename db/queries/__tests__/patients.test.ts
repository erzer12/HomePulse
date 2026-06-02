jest.mock("../../../utils/ids", () => ({ createUuid: () => "mock-uuid" }));

import type { PatientInput } from "../../../types/patient";
import type { SQLiteDatabase } from "../../connection";
import * as patients from "../patients";

const mockRun = jest.fn();
const mockGetFirst = jest.fn();
const _mockGetAll = jest.fn();

jest.mock("../../connection", () => ({
	// getDb isn't used by patients queries directly in tests; we'll pass mocked db
}));

describe("patients queries", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("createPatient calls runAsync and returns created object", async () => {
		const fakeDb = { runAsync: mockRun } as unknown as SQLiteDatabase;
		mockRun.mockResolvedValueOnce({});

		const data: PatientInput = {
			name: "Alice",
			age_group: "adult",
			chronic_conditions: ["asthma"],
		};
		const res = await patients.createPatient(fakeDb, data);

		expect(res.name).toBe("Alice");
		expect(res.chronic_conditions).toEqual(["asthma"]);
		expect(typeof res.id).toBe("string");
		expect(mockRun).toHaveBeenCalled();
		const calledSql = mockRun.mock.calls[0][0] as string;
		expect(calledSql).toContain("INSERT INTO patients");
	});

	test("getPatient returns row or null", async () => {
		const fakeDb = { getFirstAsync: mockGetFirst } as unknown as SQLiteDatabase;
		mockGetFirst.mockResolvedValueOnce({ id: "p1", name: "Bob" });
		const row = await patients.getPatient(fakeDb, "p1");
		expect(row).toBeTruthy();
		expect(row?.name).toBe("Bob");

		mockGetFirst.mockResolvedValueOnce(null);
		const none = await patients.getPatient(fakeDb, "p-x");
		expect(none).toBeNull();
	});

	test("updatePatient builds SQL with provided fields", async () => {
		const fakeDb = { runAsync: mockRun } as unknown as SQLiteDatabase;
		mockRun.mockResolvedValueOnce({});
		await patients.updatePatient(fakeDb, "pid", {
			name: "Charlie",
			medications: ["med1"],
		});
		expect(mockRun).toHaveBeenCalled();
		const callArgs = mockRun.mock.calls[0];
		const sql = callArgs[0] as string;
		expect(sql.startsWith("UPDATE patients SET")).toBe(true);
	});

	test("deletePatient calls delete SQL", async () => {
		const fakeDb = { runAsync: mockRun } as unknown as SQLiteDatabase;
		mockRun.mockResolvedValueOnce({});
		await patients.deletePatient(fakeDb, "pdel");
		expect(mockRun).toHaveBeenCalled();
		expect(mockRun.mock.calls[0][0]).toContain("DELETE FROM patients");
	});
});
