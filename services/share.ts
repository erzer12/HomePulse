export interface SharePayload {
	caseId: string;
	issuedAt: number;
}

export function createShareToken(payload: SharePayload): string {
	return encodeURIComponent(JSON.stringify(payload));
}

export function parseShareToken(token: string): SharePayload {
	return JSON.parse(decodeURIComponent(token)) as SharePayload;
}
