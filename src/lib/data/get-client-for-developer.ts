import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { Client } from "@/src/types/client";

export async function getClientForDeveloper(
  clientId: string,
  developerId: string
): Promise<Client | null>  {
  if (!developerId) {
    throw new Error("Developer ID is required");
  }
  if (!clientId) {
    throw new Error("Client ID is required");
  }

  const snapshot = await adminDb.collection("clients").doc(clientId).get();
  const data = snapshot.data();
  if (!snapshot.exists || !data || data.developerId !== developerId) {
    return null;
  }

  return {
    authUserId: data.authUserId,
    developerId: data.developerId,
    name: data.name,
    email: data.email,
    status: data.status,
    createdAt: data.createdAt.toDate(),
  };
}
