export const getOwnerDamageMultiplier = (owner: unknown) =>
  (owner as { damageMultiplier?: number } | undefined)?.damageMultiplier ?? 1;
