jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

import type { SQLiteDatabase } from "../../connection";
import * as cases from "../cases";

const mockRun = jest.fn();
const mockGetAll = jest.fn();
const _mockGetFirst = jest.fn();

describe("cases queries", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("createCase inserts and returns case object", async () => {
		const fakeDb = { runAsync: mockRun } as unknown as SQLiteDatabase;
		mockRun.mockResolvedValueOnce({});
		const res = await cases.createCase(fakeDb, "patient1");
		expect(res.patient_id).toBe("patient1");
		expect(res.status).toBe("active");
		expect(typeof res.id).toBe("string");
		expect(mockRun).toHaveBeenCalled();
	});

	test("getActiveCases calls getAllAsync", async () => {
		const fakeDb = { getAllAsync: mockGetAll } as unknown as SQLiteDatabase;
		mockGetAll.mockResolvedValueOnce([]);
		const rows = await cases.getActiveCases(fakeDb);
		expect(Array.isArray(rows)).toBe(true);
		expect(mockGetAll).toHaveBeenCalled();
	});

	test("appendSymptomEntry and getSymptomHistory", async () => {
		const fakeDb = {
			runAsync: mockRun,
			getAllAsync: mockGetAll,
		} as unknown as SQLiteDatabase;
		mockRun.mockResolvedValueOnce({});
		await cases.appendSymptomEntry(fakeDb, {
			case_id: "c1",
			timestamp: Date.now(),
			category: "fever",
			duration_hours: 1,
			hydration_status: "normal",
			consciousness: "alert",
			breathing_difficulty: false,
		});
		expect(mockRun).toHaveBeenCalled();
		mockGetAll.mockResolvedValueOnce([]);
		const history = await cases.getSymptomHistory(fakeDb, "c1");
		expect(Array.isArray(history)).toBe(true);
	});

	test("updateCaseState and closeCase call runAsync", async () => {
		const fakeDb = { runAsync: mockRun } as unknown as SQLiteDatabase;
		mockRun.mockResolvedValue({});
		await cases.updateCaseState(fakeDb, "caseX", {
			action_state: { level: 2 },
		});
		await cases.closeCase(fakeDb, "caseX");
		expect(mockRun).toHaveBeenCalled();
	});
});
