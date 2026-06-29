let _lastRaw: string | null = null;
let _lastSignature: string | null = null;
let _lastResult: boolean | null = null;

export async function verifyRuleConfigSignature(
	ruleConfigRaw: string,
	signature: string,
	secret = process.env.EXPO_PUBLIC_RULE_SIGNING_KEY ?? "",
): Promise<boolean> {
	if (!secret || !signature) return false;

	if (
		ruleConfigRaw === _lastRaw &&
		signature === _lastSignature &&
		_lastResult !== null
	) {
		return _lastResult;
	}

	// Try Node.js crypto first (for tests / node runtime)
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const nodeCrypto = await import("node:crypto");
		const hmac = nodeCrypto
			.createHmac("sha256", secret)
			.update(ruleConfigRaw)
			.digest("hex");
		const ok = hmac === signature.trim().toLowerCase();
		_lastRaw = ruleConfigRaw;
		_lastSignature = signature;
		_lastResult = ok;
		return ok;
	} catch (_e) {
		// Fallback to expo-crypto (mobile). Note: expo-crypto doesn't provide HMAC directly,
		// so we use a less-ideal `secret:payload` hashing scheme as a fallback for demo only.
		try {
			// dynamic import to keep native-only dependency optional
			// biome-ignore lint/suspicious/noTsIgnore: dynamic import fallback
			// @ts-ignore
			const ExpoCrypto = await import("expo-crypto");
			const candidate = `${secret}:${ruleConfigRaw}`;
			const digest = await ExpoCrypto.digestStringAsync(
				// biome-ignore lint/suspicious/noTsIgnore: dynamic import fallback
				// @ts-ignore
				ExpoCrypto.CryptoDigestAlgorithm.SHA256,
				candidate,
			);
			const ok = digest.trim().toLowerCase() === signature.trim().toLowerCase();
			_lastRaw = ruleConfigRaw;
			_lastSignature = signature;
			_lastResult = ok;
			return ok;
		} catch (_e2) {
			return false;
		}
	}
}
