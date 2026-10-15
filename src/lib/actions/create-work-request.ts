"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { Role } from "@/src/types/role";
import { ActionResult } from "@/src/types/action-result";

export async function createWorkRequest(
  formData: FormData,
): Promise<ActionResult<string>> {
  const serverUser = await getServerUser();

  if (!serverUser || serverUser.role !== Role.Client) {
    return {
      ok: false,
      error: "You must be signed in as a client to create a work request",
    };
  }

  const clientRef = adminDb.collection("clients").doc(serverUser.uid);
  const clientSnap = await clientRef.get();

  if (!clientSnap.exists) {
    return {
      ok: false,
      error: "Client does not exist",
    };
  }

  const clientData = clientSnap.data();
  const developerId = clientData?.developerId;

  if (!developerId) {
    return {
      ok: false,
      error: "Developer ID not found",
    };
  }

  const developerRef = adminDb.collection("developers").doc(developerId);
  const developerSnap = await developerRef.get();

  if (!developerSnap.exists) {
    return {
      ok: false,
      error: "Developer does not exist",
    };
  }

  const title = formData.get("title");
  const description = formData.get("description");

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    !title.trim() ||
    !description.trim()
  ) {
    return {
      ok: false,
      error: "Title and description are required",
    };
  }

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  try {
    const now = new Date();
    const workRequestRef = await adminDb.collection("workRequests").add({
      title: trimmedTitle,
      description: trimmedDescription,
      clientId: clientRef.id,
      developerId,
      status: "open",
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
