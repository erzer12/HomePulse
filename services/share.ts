import { createCompactId } from "../utils/ids";

export function generateShareToken(): string {
	// 128-bit token (32 hex chars) using UUIDv4 without dashes
	return createCompactId();
}

export function generateShareLink(token: string): string {
	return `homepulse://case/${token}`;
}

export function generateShareText(
	token: string,
	title = "Shared case",
	tasks: string[] = [],
) {
	const link = generateShareLink(token);
	return [
		title,
		"",
		`Open: ${link}`,
		"",
		"Tasks:",
		...tasks.map((t) => `- ${t}`),
	].join("\n");
}

export function parseDeepLink(url: string): { token: string } | null {
	const m = url.match(/homepulse:\/\/case\/([a-f0-9]{32})/i);
	return m ? { token: m[1] } : null;
}
