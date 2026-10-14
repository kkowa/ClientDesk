import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";
import { ServerUser } from "@/src/types/server-user";
import { getServerUser } from "../auth/auth-server";

/*
  This ensures that:
  - A client can access their own document.
  - A developer can access documents belonging to their clients.
  - Neither can access another developer's clients.
*/

export async function requireClientAccess(clientId: string) {
  const user: ServerUser | null = await getServerUser();

  if (!user) {
    throw new Error("User not verified");
  }

  const clientDoc = await adminDb
    .collection("clients")
    .doc(clientId)
    .get();

  if (!clientDoc.exists) {
    throw new Error("Client not found");
  }

  const client = clientDoc.data()!;

  if (user.role === Role.Client) {
    if (client.authUserId !== user.uid) {
      throw new Error("Access denied");
    }
  } else if (user.role === Role.Developer) {
    const developerSnapshot = await adminDb
      .collection("developers")
      .where("authUserId", "==", user.uid)
      .limit(1)
      .get();

    if (
      developerSnapshot.empty ||
      developerSnapshot.docs[0].id !== client.developerId
    ) {
      throw new Error("Access denied");
    }
  } else {
    throw new Error("Access denied");
  }

  return {
    id: clientDoc.id,
    data: client,
  };
}
