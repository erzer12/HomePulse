import { useTasksStore } from "../tasks";

jest.mock("@/db/connection", () => ({ getDb: async () => ({}) }));

const mockCreate = jest.fn();
const mockGetForCase = jest.fn();
const mockUpdateTaskStatus = jest.fn();

jest.mock("@/db/queries/tasks", () => ({
	createTask: (...args: unknown[]) => mockCreate(...(args as unknown[])),
	getTasksForCase: (...args: unknown[]) =>
		mockGetForCase(...(args as unknown[])),
	updateTaskStatus: (...args: unknown[]) =>
		mockUpdateTaskStatus(...(args as unknown[])),
}));

const mockSupabaseUpdate = jest.fn();
jest.mock("@/services/supabase", () => ({
	updateTaskStatus: (...args: unknown[]) =>
		mockSupabaseUpdate(...(args as unknown[])),
}));

const mockEnqueue = jest.fn();
jest.mock("@/services/sync", () => ({
	enqueueSyncOperation: (...args: unknown[]) =>
		mockEnqueue(...(args as unknown[])),
}));

describe("Tasks store", () => {
	beforeEach(() => {
		// reset store
		useTasksStore.setState({ tasks: {}, loading: false, error: null });
		jest.clearAllMocks();
	});

	test("createTask adds task to store", async () => {
		const caseId = "case1";
		const returned = {
			id: "t1",
			case_id: caseId,
			title: "Do thing",
			description: null,
			status: "pending",
			created_at: Date.now(),
		};
		mockCreate.mockResolvedValueOnce(returned);

		const t = await useTasksStore.getState().createTask(caseId, "Do thing");
		expect(t.id).toBe("t1");
		const s = useTasksStore.getState();
		expect(s.tasks[caseId]).toBeDefined();
		expect(s.tasks[caseId][0].id).toBe("t1");
	});

	test("markDone updates DB, optimistically updates store, and enqueues on supabase failure", async () => {
		const caseId = "caseA";
		const task = {
			id: "taskX",
			case_id: caseId,
			title: "Check temp",
			status: "pending",
			created_at: Date.now(),
		};
		// prime store
		useTasksStore.setState({ tasks: { [caseId]: [task] } });

		mockUpdateTaskStatus.mockResolvedValueOnce(undefined);
		mockSupabaseUpdate.mockRejectedValueOnce(new Error("network"));

		await useTasksStore.getState().markDone(task.id, caseId);

		const s = useTasksStore.getState();
		expect(s.tasks[caseId][0].status).toBe("done");
		expect(mockEnqueue).toHaveBeenCalledWith(
			"task",
			task.id,
			"update_status",
			{ id: task.id, status: "done" },
			{ idempotencyKey: task.id },
		);
	});
});
