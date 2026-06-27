import { create } from "zustand";
import type { SymptomCategory } from "@/types/triage";

/**
 * Persists the mid-questionnaire answers so the user can resume after
 * backgrounding the app or navigating away.
 */

export interface DraftState {
	/** The symptom category the user selected. */
	category: SymptomCategory | null;
	/** The patient ID the check was started for. */
	patientId: string | null;
	/** The case ID the check belongs to. */
	caseId: string | null;
	/** Accumulated answers keyed by question ID. */
	answers: Record<string, string | number | boolean>;
	/** The index of the last question the user was on. */
	currentIndex: number;
	/** Unix timestamp when the draft was saved. */
	savedAt: number | null;

	// Actions
	saveDraft: (draft: Omit<DraftState, "savedAt" | keyof DraftActions>) => void;
	clearDraft: () => void;
	hasDraft: () => boolean;
}

type DraftActions = Pick<DraftState, "saveDraft" | "clearDraft" | "hasDraft">;

const DRAFT_STALE_MS = 30 * 60 * 1000; // 30 minutes

export const useDraftStore = create<DraftState>((set, get) => ({
	category: null,
	patientId: null,
	caseId: null,
	answers: {},
	currentIndex: 0,
	savedAt: null,

	saveDraft: (draft) => {
		set({ ...draft, savedAt: Date.now() });
	},

	clearDraft: () => {
		set({
			category: null,
			patientId: null,
			caseId: null,
			answers: {},
			currentIndex: 0,
			savedAt: null,
		});
	},

	hasDraft: () => {
		const state = get();
		if (!state.category || !state.caseId || state.savedAt === null)
			return false;
		// Consider draft stale after 30 minutes
		return Date.now() - state.savedAt < DRAFT_STALE_MS;
	},
}));
