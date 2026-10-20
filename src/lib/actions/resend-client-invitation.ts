"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { createInvitationCredentials } from "@/src/lib/actions/client-invitation-server";
import { clientAccountSchema } from "@/src/lib/validation/client-invitation";
import type { ActionResult } from "@/src/types/action-result";
import type { Invitation } from "@/src/lib/actions/client-invitation-shared";
import { Role } from "@/src/types/role";
import { getUserContact } from "../data/get-user-contact";

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

  let developerName: string;
  try {
    const developerContact = await getUserContact(developerId, Role.Developer);
    if (!developerContact.ok) {
      return {
        ok: false,
        error: "We couldn't retrieve your developer profile. Please try again.",
      };
    }
    developerName = developerContact.data.name;
  } catch {
    return {
      ok: false,
      error: "We couldn't retrieve your developer profile. Please try again.",
    };
  }

  if (!developerName.trim() || developerName === "N/A") {
    return {
      ok: false,
      error:
        "Add your full name to your developer profile before inviting a client",
    };
  }

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
    .where("email", "==", parsed.data.email.toLowerCase())
    .where("developerId", "==", developerId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { ok: false, error: "No client found with this email" };
  }

  const docRef = snapshot.docs[0].ref;

  const { token, tokenHash, expiresAt } = createInvitationCredentials();

  try {
    const transactionResult = await adminDb.runTransaction(
      async (transaction) => {
        const snap = await transaction.get(docRef);

        if (!snap.exists) {
          return {
            ok: false,
            error: "No client found with this email",
          } as const;
        }

        const data = snap.data();

        if (
          data?.status !== "invited" &&
          data?.status !== "activation_failed"
        ) {
          return {
            ok: false,
            error: "This client cannot be re-invited",
          } as const;
        }

        transaction.update(docRef, {
          registrationTokenHash: tokenHash,
          registrationExpiresAt: expiresAt,
          status: "invited",
        });

        return {
          ok: true,
          data,
        } as const;
      },
    );

    if (!transactionResult.ok) {
      return transactionResult;
    }

    const client = transactionResult.data;

    return {
      ok: true,
      data: {
        uid: client.authUserId,
        token,
        clientName: client.name,
        clientEmail: client.email,
        developerName,
      },
    };
  } catch {
    return {
      ok: false,
      error: "We couldn't update the client invitation. Please try again.",
    };
  }
}
