export function safeParseJson<T>(
	raw: string | null | undefined,
	fallback: T,
): T {
	if (raw === null || raw === undefined || raw.trim() === "") {
		return fallback;
	}
	try {
		return JSON.parse(raw) as T;
	} catch (e) {
		// Log error for diagnostics, but do not let it throw
		console.error("safeParseJson failed to parse:", raw, e);
		return fallback;
	}
}
