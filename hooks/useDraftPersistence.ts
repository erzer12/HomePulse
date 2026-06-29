import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useDraftStore } from "@/store/draft";
import type { SymptomCategory } from "@/types/triage";

interface DraftSnapshot {
	category: SymptomCategory;
	patientId: string;
	caseId: string;
	answers: Record<string, string | number | boolean>;
	currentIndex: number;
}

/**
 * Listens for the app being backgrounded and saves a questionnaire draft.
 * The draft is cleared when the user finishes or explicitly discards.
 *
 * Usage: call inside questionnaire.tsx, pass a getter for the current state.
 */
export function useDraftPersistence(getSnapshot: () => DraftSnapshot | null) {
	const saveDraft = useDraftStore((s) => s.saveDraft);
	const snapshotRef = useRef(getSnapshot);
	snapshotRef.current = getSnapshot;

	useEffect(() => {
		const handleAppStateChange = (nextState: AppStateStatus) => {
			if (nextState === "background" || nextState === "inactive") {
				const snapshot = snapshotRef.current();
				if (snapshot) {
					saveDraft(snapshot);
				}
			}
		};

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange,
		);
		return () => subscription.remove();
	}, [saveDraft]);
}
