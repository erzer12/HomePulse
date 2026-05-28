import * as Crypto from 'expo-crypto';

export async function verifyRuleConfigSignature(
  ruleConfigRaw: string,
  signature: string,
  secret = process.env.EXPO_PUBLIC_RULES_SIGNATURE_SECRET ?? ''
): Promise<boolean> {
  if (!secret || !signature) return false;

  const expected = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${secret}:${ruleConfigRaw}`
  );
  const provided = signature.trim().toLowerCase();
  return expected === provided;
}
