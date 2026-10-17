import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { Client } from "@/src/types/client";

export async function getClientsForDeveloper(
  developerId: string,
): Promise<Client[]> {
  if (!developerId) {
    throw new Error("Developer ID is required");
  }

  const snapshot = await adminDb
    .collection("clients")
    .where("developerId", "==", developerId)
    .get();

  const clients = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      authUserId: data.authUserId,
      developerId: data.developerId,
      name: data.name,
      email: data.email,
      status: data.status,
      createdAt: data.createdAt.toDate().toISOString(),
    };
  });

  return clients;
}
