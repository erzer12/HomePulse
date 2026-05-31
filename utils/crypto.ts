import { createHash } from 'crypto';

export async function verifyRuleConfigSignature(
  ruleConfigRaw: string,
  signature: string,
  secret = process.env.EXPO_PUBLIC_RULES_SIGNATURE_SECRET ?? ''
): Promise<boolean> {
  if (!secret || !signature) return false;

  const expected = createHash('sha256').update(`${secret}:${ruleConfigRaw}`).digest('hex');
  const provided = signature.trim().toLowerCase();
  return expected === provided;
}
