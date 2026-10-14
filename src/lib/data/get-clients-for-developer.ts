"use server";

import { adminDb } from "@/src/lib/firebase/admin";

export async function getClientsForDeveloper(developerId: string) {
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
      id: doc.id,
      name: data.name,
      email: data.email,
      status: data.status,
    };
  });

  return clients;
}