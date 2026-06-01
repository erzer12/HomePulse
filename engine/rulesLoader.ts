import type { RuleConfig } from "../types/triage";
import { verifyRuleConfigSignature } from "../utils/crypto";

let _cached: { config: RuleConfig; verified: boolean } | null = null;

export async function loadBundledRuleConfig(): Promise<{
	config: RuleConfig;
	verified: boolean;
} | null> {
	if (_cached) return _cached;
	try {
		// Require the bundled JSON rule file
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const cfg: RuleConfig = require("./rules/v1.0.0.json");
		const raw = JSON.stringify(cfg);
		const verified = await verifyRuleConfigSignature(raw, cfg.signature ?? "");
		_cached = { config: cfg, verified };
		return _cached;
	} catch (_e) {
		return null;
	}
}

export function getCachedRuleConfig() {
	return _cached;
}
