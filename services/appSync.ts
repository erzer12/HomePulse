import { AppState } from "react-native";
import { flushSyncQueue } from "./sync";

let _started = false;

export function startAppSync() {
	if (_started) return;
	_started = true;

	// Flush immediately on startup to retry any operations from previous sessions
	flushSyncQueue().catch((e) => {
		// eslint-disable-next-line no-console
		console.warn("flushSyncQueue (startup) failed", e);
	});

	const handler = (nextState: string) => {
		if (nextState === "active") {
			// flush a small batch when app becomes active
			flushSyncQueue().catch((e) => {
				// eslint-disable-next-line no-console
				console.warn("flushSyncQueue failed", e);
			});
		}
	};

	// Add listener
	AppState.addEventListener("change", handler);
}

export function stopAppSync() {
	// not strictly needed in app lifecycle, provided for tests
	_started = false;
}
