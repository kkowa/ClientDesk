"use server";

import { createHash, randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/src/lib/firebase/admin";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import {
  clientAccountSchema,
  clientRegistrationSchema,
} from "@/src/lib/validation/client-invitation";
import { Role } from "@/src/types/role";
import type { ActionResult } from "@/src/types/action-result";
import type { Developer } from "@/src/types/developer";

const developerConverter: FirebaseFirestore.FirestoreDataConverter<Developer> = {
  toFirestore(dev: Developer) {
    return dev;
  },
  fromFirestore(snapshot) {
    return snapshot.data() as Developer;
  },
};


const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createClientInvitation(formData: FormData): Promise<
  ActionResult<{
    uid: string;
    token: string;
    clientName: string;
    clientEmail: string;
    developerName: string;
  }>
> {
  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    return {
      ok: false,
      error: "You must be signed in as a developer to create a client account",
    };
  }
  const developerId = developerResult.data;

  const parsed = clientAccountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false,
      error: firstIssue.path.includes("name")
        ? "Please enter the client's full name"
        : "Please enter a valid email address",
    };
  }

  const name = parsed.data.name;
  const email = parsed.data.email.toLowerCase();
  try {
    await adminAuth.getUserByEmail(email);
    return {
      ok: false,
      error: "An account with this email address already exists",
    };
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") {
      return {
        ok: false,
        error: "We couldn't verify this email address. Please try again",
      };
    }
  }

  try {
    const developerRef = adminDb
      .collection("developers")
      .doc(developerId)
      .withConverter(developerConverter);

    const developerSnapshot = await developerRef.get();

    if (!developerSnapshot.exists) {
      return { ok: false, error: "Your developer profile could not be found" };
    }

    const developerData = developerSnapshot.data();
    if (!developerData) {
      return { ok: false, error: "Your developer profile could not be found" };
    }

    const developerName = developerData.name;
    if (!developerName.trim()) {
      return {
        ok: false,
        error:
          "Add your full name to your developer profile before inviting a client",
      };
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const temporaryPassword = randomBytes(32).toString("base64url");
    const userRecord = await adminAuth.createUser({
      email,
      password: temporaryPassword,
      displayName: name,
    });

    try {
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        role: Role.Client,
      });

      await adminDb
        .collection("clients")
        .doc(userRecord.uid)
        .set({
          authUserId: userRecord.uid,
          developerId,
          name,
          email,
          status: "invited",
          registrationTokenHash: hashToken(token),
          registrationExpiresAt: expiresAt,
          createdAt: new Date(),
        });
    } catch {
      try {
        await adminAuth.deleteUser(userRecord.uid);
      } catch {
        await adminDb.collection("failedInvitations").doc(userRecord.uid).set({
          email,
          developerId,
          reason: "AUTH_USER_NOT_DELETED",
          createdAt: new Date(),
        });

        return {
          ok: false,
          error:
            "We couldn't finish creating the client account. Please try again. If this continues, contact support.",
        };
      }

      return {
        ok: false,
        error: "We couldn't create the client account. Please try again.",
      };
    }

    return {
      ok: true,
      data: {
        uid: userRecord.uid,
        token,
        clientName: name,
        clientEmail: email,
        developerName,
      },
    };
  } catch (error) {
    if ((error as { code?: string }).code === "auth/email-already-exists") {
      return {
        ok: false,
        error: "An account with this email address already exists",
      };
    }
    return {
      ok: false,
      error: "We couldn't create the client account. Please try again",
    };
  }
}

export async function completeClientRegistration(
  uid: string,
  token: string,
  formData: FormData,
): Promise<ActionResult<string>> {
  const parsed = clientRegistrationSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please enter a password with at least 6 characters",
    };
  }
  if (!uid || !token || token.length !== 64) {
    return {
      ok: false,
      error: "This registration link is invalid or has expired",
    };
  }

  const clientRef = adminDb.collection("clients").doc(uid);
  const tokenHash = hashToken(token);
  let inviteData: { name: string; registrationExpiresAt: number };
  try {
    inviteData = await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(clientRef);
      const data = snapshot.data();
      if (
        !snapshot.exists ||
        data?.status !== "invited" ||
        data.registrationTokenHash !== tokenHash ||
        typeof data.registrationExpiresAt !== "number" ||
        data.registrationExpiresAt < Date.now()
      ) {
        throw new Error("INVALID_INVITATION");
      }

      transaction.update(clientRef, {
        status: "registering",
        registrationTokenHash: FieldValue.delete(),
        registrationExpiresAt: FieldValue.delete(),
      });
      return {
        name: data.name as string,
        registrationExpiresAt: data.registrationExpiresAt as number,
      };
    });
  } catch {
    return {
      ok: false,
      error: "This registration link is invalid or has expired",
    };
  }

  try {
    await adminAuth.updateUser(uid, {
      password: parsed.data.password,
      displayName: inviteData.name,
    });

    await clientRef.update({
      status: "active",
      activatedAt: new Date(),
    });

    return { ok: true, data: "Your account is ready. You can now sign in." };
  } catch {
    await clientRef.update({
      status: "activation_failed",
      activationFailedAt: new Date(),
    });

    return {
      ok: false,
      error:
        "We couldn't finish registering your account. Your developer will need to send a new invitation.",
    };
  }
}
