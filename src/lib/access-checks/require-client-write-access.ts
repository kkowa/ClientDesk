import { requireDeveloperId } from "./require-developer-id";
import { adminDb } from "@/src/lib/firebase/admin";

// This ensures that only the developer who owns the client can write to the client's document.

export async function requireClientWriteAccess(clientId: string) {
  const developerId = await requireDeveloperId();

  const clientDoc = await adminDb
    .collection("clients")
    .doc(clientId)
    .get();

  if (!clientDoc.exists) {
    throw new Error("Client not found");
  }

  if (clientDoc.data()?.developerId !== developerId) {
    throw new Error("Access denied");
  }

  return clientDoc;
}
