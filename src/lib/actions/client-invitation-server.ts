import "server-only";

import { createHash, randomBytes } from "node:crypto";

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createInvitationCredentials() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashInvitationToken(token);
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  return { token, tokenHash, expiresAt };
}
