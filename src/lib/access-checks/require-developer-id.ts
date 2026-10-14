import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";
import { ServerUser } from "@/src/types/server-user";
import { getServerUser } from "../auth/auth-server";

// This ensures that the current user is a verified developer and returns their developer ID.

export async function requireDeveloperId(): Promise<string> {
  const user: ServerUser | null = await getServerUser();

  if (!user) {
    throw new Error("User not verified");
  }

  if (user.role !== Role.Developer) {
    throw new Error("Access denied");
  }

  const snapshot = await adminDb
    .collection("developers")
    .where("authUserId", "==", user.uid)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error("Developer not found");
  }

  return snapshot.docs[0].id;
}
