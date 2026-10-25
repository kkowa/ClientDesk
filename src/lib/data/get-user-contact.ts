import { adminDb } from "@/src/lib/firebase/admin";
import { ActionResult } from "@/src/types/action-result";
import { Role } from "@/src/types/role";
import { UserContact } from "@/src/types/user-contact";

export async function getUserContact(userId: string, role: Role): Promise<ActionResult<UserContact>> {
  let docRef;
  switch (role) {
    case Role.Developer:
      docRef = adminDb.collection("developers").doc(userId);
      break;
    case Role.Client:
      docRef = adminDb.collection("clients").doc(userId);
      break;
    default:
      return { ok: false, error: "Invalid role" };
  }
  const userSnapshot = await docRef.get();
  const name = userSnapshot.data()?.name ?? "N/A";
  const email = userSnapshot.data()?.email ?? "N/A";
  return { ok: true, data: { name, email } };
}
