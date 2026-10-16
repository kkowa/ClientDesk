import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { adminDb } from "@/src/lib/firebase/admin";
import type { Developer } from "@/src/types/developer";

const developerConverter: FirebaseFirestore.FirestoreDataConverter<Developer> =
  {
    toFirestore(developer) {
      return developer;
    },
    fromFirestore(snapshot) {
      return snapshot.data() as Developer;
    },
  };

export async function getDeveloperProfile(
  developerId: string,
): Promise<Developer | null> {
  const snapshot = await adminDb
    .collection("developers")
    .doc(developerId)
    .withConverter(developerConverter)
    .get();

  return snapshot.data() ?? null;
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createInvitationCredentials() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashInvitationToken(token);
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  return { token, tokenHash, expiresAt };
}
