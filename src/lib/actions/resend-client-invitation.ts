"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import {
  createInvitationCredentials,
  getDeveloperProfile,
} from "@/src/lib/actions/client-invitation-server";
import { clientAccountSchema } from "@/src/lib/validation/client-invitation";
import type { ActionResult } from "@/src/types/action-result";
import type { Invitation } from "@/src/lib/actions/client-invitation-shared";

export async function resendClientInvitation(
  email: string,
): Promise<ActionResult<Invitation>> {
  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    return {
      ok: false,
      error: "You must be signed in as a developer to create a client account",
    };
  }

  const developerId = developerResult.data;

  const developerData = await getDeveloperProfile(developerId);
  if (!developerData) {
    return { ok: false, error: "Your developer profile could not be found" };
  }

  const developerName = developerData.name ?? "";

  const parsed = clientAccountSchema.pick({ email: true }).safeParse({
    email,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please enter a valid email address",
    };
  }

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

  const { token, tokenHash, expiresAt } = createInvitationCredentials();

  try {
    await doc.ref.update({
      registrationTokenHash: tokenHash,
      registrationExpiresAt: expiresAt,
      status: "invited",
    });
  } catch {
    return {
      ok: false,
      error: "We couldn't update the client invitation. Please try again.",
    };
  }

  return {
    ok: true,
    data: {
      uid: data.authUserId,
      token,
      clientName: data.name,
      clientEmail: data.email,
      developerName,
    },
  };
}
