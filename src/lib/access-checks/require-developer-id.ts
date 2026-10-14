import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";
import { ServerUser } from "@/src/types/server-user";
import { getServerUser } from "../auth/auth-server";
import { ActionResult } from "@/src/types/action-result";

// This ensures that the current user is a verified developer and
// returns an ActionResult containing their developer ID on success.
// Can take an optional user parameter to save an extra lookup if
// the user is already available.

export async function requireDeveloperId(user?: ServerUser | null): Promise<ActionResult<string>> {
  if (!user) {
    try {
      user = await getServerUser();
    } catch (error) {
      console.error("Failed to get server user:", error);
      return { ok: false, error: "Failed to get server user" };
    }
  }

  if (!user) {
    return { ok: false, error: "Access denied" };
  }

  if (user.role !== Role.Developer) {
    return { ok: false, error: "Access denied" };
  }

  try {
    const snapshot = await adminDb
      .collection("developers")
      .where("authUserId", "==", user.uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { ok: false, error: "Access denied" };
    }
    return { ok: true, data: snapshot.docs[0].id }; 
  } catch (error) {
    console.error("Failed to retrieve developer ID:", error);
    return { ok: false, error: "Failed to retrieve developer ID" };
  }
}
