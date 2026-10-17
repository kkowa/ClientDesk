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

  const snapshot = await adminDb
    .collection("clients")
    .where("developerId", "==", developerId)
    .where("authUserId", "==", clientId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null; // or throw an error if you prefer
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    authUserId: data.authUserId,
    developerId: data.developerId,
    name: data.name,
    email: data.email,
    status: data.status,
    createdAt: data.createdAt.toDate().toISOString(),
  };
}
