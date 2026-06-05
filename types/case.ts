import type { ActionState, SymptomEntry, TriageOutput } from "./triage";

export interface CaseRecord {
	id: string;
	patient_id: string;
	status: "active" | "closed";
	timeline: SymptomEntry[];
	current_action_state?: ActionState;
	triage_output?: TriageOutput;
}
