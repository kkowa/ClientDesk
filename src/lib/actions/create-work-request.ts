"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { WorkRequestStatus } from "@/src/types/work-request";
import { ActionResult } from "@/src/types/action-result";
import { requireClientId } from "@/src/lib/access-checks/require-client-id";
import { getClientsDeveloperId } from "@/src/lib/data/get-clients-developer-id";

// On success, returns the document ID of the newly created work request.

export async function createWorkRequest(
  formData: FormData,
): Promise<ActionResult<string>> {

  let clientId: string;
  try {
    const result = await requireClientId();
    if (result.ok) {
      clientId = result.data;
    } else {
      console.error("Client ID requirement failed:", result.error);
      return { ok: false, error: "Client ID requirement failed" };
    }
  } catch (error) {
    console.error("Failed to require client ID:", error);
    return { ok: false, error: "Failed to require client ID" };
  }

  let developerId: string | null = null;
  try {
    const result = await getClientsDeveloperId(clientId);
    if (result.ok) {
      developerId = result.data;
    } else {
      console.error("Failed to get developer ID:", result.error);
      return { ok: false, error: "Failed to get developer ID" };
    }
  } catch (error) {
    console.error("Error while getting developer ID:", error);
    return { ok: false, error: "Error while getting developer ID" };
  }

  if (!developerId) {
    return {
      ok: false,
      error: "Developer ID not found",
    };
  }

  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();

  // use Zod instead
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    !title ||
    !description
  ) {
    return {
      ok: false,
      error: "Title and description are required",
    };
  }

  try {
    const now = new Date();
    const workRequestRef = await adminDb.collection("workRequests").add({
      title,
      description,
      clientId,
      developerId,
      status: WorkRequestStatus.Open,
      submittedAt: now,
      updatedAt: now,
    });

    return {
      ok: true,
      data: workRequestRef.id,
    };
  } catch (error) {
    console.error("Failed to create work request:", error);

    return {
      ok: false,
      error: "Failed to create work request",
    };
  }
}
