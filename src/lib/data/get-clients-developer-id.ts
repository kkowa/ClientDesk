import { adminDb } from "@/src/lib/firebase/admin";
import { ActionResult } from "@/src/types/action-result";

export async function getClientsDeveloperId(clientId: string): Promise<ActionResult<string | null>> {
  try {
    const clientRef = adminDb.collection("clients").doc(clientId);
    const clientSnap = await clientRef.get();

    if (!clientSnap.exists) {
      return { ok: false, error: "Client does not exist" };
    }

    const clientData = clientSnap.data();
    return { ok: true, data: clientData?.developerId || null };
  } catch (error) {
    console.error("Failed to get client's developer ID:", error);
    return { ok: false, error: "Failed to get client's developer ID" };
  }
}
