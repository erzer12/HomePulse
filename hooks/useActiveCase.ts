import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";

/**
 * Derives which state the Home tab should render.
 *
 * - If there is exactly 1 active case, returns it alongside the matching profile name.
 * - If there are 0 active cases, returns null.
 * - Multi-case handling is delegated to the caller (use activeCases from DB).
 */
export function useActiveCase() {
	const activeCase = useCaseStore((s) => s.activeCase);
	const profiles = usePatientStore((s) => s.profiles);

	const patient = activeCase
		? (profiles.find((p) => p.id === activeCase.patient_id) ?? null)
		: null;

	return {
		activeCase: activeCase ?? null,
		patient,
		patientName: patient?.name ?? "Unknown",
		hasActiveCase: !!activeCase,
		level: activeCase?.triage_output?.action_state?.level ?? null,
	};
}
