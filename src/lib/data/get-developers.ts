import type { Developer } from "@/src/types/developer";
import { adminDb } from "@/src/lib/firebase/admin";


export async function getDevelopers(): Promise<Developer[]> {
  const snapshot = await adminDb.collection("developers").get();
  const developers = snapshot.docs.map((doc) => ({
    authUserId: doc.data().authUserId,
    name: doc.data().name,
    email: doc.data().email,
    createdAt: doc.data().createdAt.toDate(),
  }));
  return developers;
}
