import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { getServerUser } from "@/src/lib/auth/auth-server"
import { requireDeveloperId } from "./require-developer-id";
import { Role } from "@/src/types/role";
import { ServerUser } from "@/src/types/server-user";
import { ActionResult } from "@/src/types/action-result";

// This ensures that either the client is accessing their own ID or the
// developer is accessing a client they own.
// Takes an optional user parameter (the current user) to save an
// extra lookup if the user is already available.
// Client does not need to provide their ID, developer does.
// Returns an ActionResult containing the client ID if access is granted.

export async function requireClientId(user?: ServerUser | null, clientId?: string): Promise<ActionResult<string>> {
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

  if (user.role === Role.Client) {
    try {
      const snapshot = await adminDb
        .collection("clients")
        .where("authUserId", "==", user.uid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { ok: false, error: "Access denied" };
      }
      const ownClientId = snapshot.docs[0].id;

      if (clientId === undefined || clientId !== ownClientId) {
        return { ok: false, error: "Access denied" };
      }

      return { ok: true, data: ownClientId };

    } catch (error) {
      console.error("Failed to retrieve client ID:", error);
      return { ok: false, error: "Failed to retrieve client ID" };
    }

  }

  if (user.role === Role.Developer) {
    if (!clientId) {
      return { ok: false, error: "Client ID required" };
    }

    let developerId: string;
    try {
      const result = await requireDeveloperId(user);
      if (!result.ok) {
        return { ok: false, error: "Access denied" };
      }
      developerId = result.data;
    } catch (error) {
      console.error("Failed to retrieve developer ID:", error);
      return { ok: false, error: "Failed to retrieve developer ID" };
    }

    try {
      const clientDoc = await adminDb
        .collection("clients")
        .doc(clientId)
        .get();

      if (
        !clientDoc.exists ||
        clientDoc.data()?.developerId !== developerId
      ) {
        return { ok: false, error: "Access denied" };
      }

      return { ok: true, data: clientId };
    } catch (error) {
      console.error("Failed to retrieve client document:", error);
      return { ok: false, error: "Failed to retrieve client document" };
    }
  }

  return { ok: false, error: "Access denied" };
}
