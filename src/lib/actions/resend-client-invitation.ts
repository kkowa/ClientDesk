"use server";

import { randomBytes, createHash } from "crypto";
import { adminDb } from "@/src/lib/firebase/admin";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";

type ResendInvitationResult =
  | {
      ok: true;
      data: {
        uid: string;
        token: string;
        link: string;
        clientName: string;
        clientEmail: string;
        developerName: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function resendClientInvitation(
  email: string,
  origin: string,
): Promise<ResendInvitationResult> {
  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    return {
      ok: false,
      error: "You must be signed in as a developer to create a client account",
    };
  }

  const developerId = developerResult.data;

  const snapshot = await adminDb
    .collection("clients")
    .where("email", "==", email.toLowerCase())
    .where("developerId", "==", developerId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { ok: false, error: "No client found with this email" };
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  if (data.status !== "invited" && data.status !== "activation_failed") {
    return { ok: false, error: "This client cannot be re-invited" };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  await doc.ref.update({
    registrationTokenHash: hashToken(token),
    registrationExpiresAt: expiresAt,
    status: "invited",
  });

  const link = `${origin}/client/registration?uid=${encodeURIComponent(
    data.authUserId,
  )}&token=${encodeURIComponent(token)}`;

  return {
    ok: true,
    data: {
      uid: data.authUserId,
      token,
      link,
      clientName: data.name,
      clientEmail: data.email,
      developerName: data.developerName,
    },
  };
}
