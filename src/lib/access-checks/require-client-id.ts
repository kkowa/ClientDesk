import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { getServerUser } from "@/src/lib/auth/auth-server"
import { requireDeveloperId } from "./require-developer-id";
import { Role } from "@/src/types/role";
import { ServerUser } from "@/src/types/server-user";

// This ensures that either the client is accessing their own ID or the
// developer is accessing a client they own.
// Client does not need to provide their ID, developer does.

export async function requireClientId(clientId?: string): Promise<string> {
  const user: ServerUser | null = await getServerUser();

  if (!user) {
    throw new Error("User not verified");
  }

  if (user.role === Role.Client) {
    const snapshot = await adminDb
      .collection("clients")
      .where("authUserId", "==", user.uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error("Client not found");
    }

    const ownClientId = snapshot.docs[0].id;

    if (clientId !== undefined && clientId !== ownClientId) {
      throw new Error("Access denied");
    }

    return ownClientId;
  }

  if (user.role === Role.Developer) {
    if (!clientId) {
      throw new Error("Client ID required");
    }

    const developerId = await requireDeveloperId();

    const clientDoc = await adminDb
      .collection("clients")
      .doc(clientId)
      .get();

    if (
      !clientDoc.exists ||
      clientDoc.data()?.developerId !== developerId
    ) {
      throw new Error("Access denied");
    }

    return clientId;
  }

  throw new Error("Access denied");
}
