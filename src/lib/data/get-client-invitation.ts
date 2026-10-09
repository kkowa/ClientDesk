import "server-only";

import { createHash } from "node:crypto";
import { adminDb } from "@/src/lib/firebase/admin";

export async function getClientInvitation(uid: string, token: string) {
  if (!uid || token.length !== 64) return null;

  const snapshot = await adminDb.collection("clients").doc(uid).get();
  const data = snapshot.data();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  if (
    !snapshot.exists ||
    data?.status !== "invited" ||
    data.registrationTokenHash !== tokenHash ||
    typeof data.registrationExpiresAt !== "number" ||
    data.registrationExpiresAt < Date.now()
  ) {
    return null;
  }

  return {
    uid,
    token,
    name: data.name as string,
    email: data.email as string,
  };
}
