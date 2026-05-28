export function verifyRuleConfigSignature(_ruleConfigRaw: string, signature: string): boolean {
  return Boolean(signature && signature.length > 0);
}
