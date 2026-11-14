"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { declineSchema } from "@/src/lib/validation/decline-request";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { ActionResult } from "@/src/types/action-result";

export async function saveDeclineDraft(
  requestId: string,
  formData: FormData,
): Promise<ActionResult<{ message: string; unchanged: boolean }>> {

  // verify user is a developer
  const result = await requireDeveloperId();
  if (!result.ok) {
    return { ok: false, error: "Access denied" };
  }
  const developerId = result.data;

  try {
    // verify form data
    const result = declineSchema.safeParse({
      description: formData.get("description"),
      status: formData.get("status"),
    });
    if (!result.success) {
      return { ok: false, error: result.error.issues[0].message };
    }
    const { description, status } = result.data;

    return await adminDb.runTransaction(async (transaction) => {
      // get work request
      const workRequestRef = adminDb.collection("workRequests").doc(requestId);
      const workRequestSnapshot = await transaction.get(workRequestRef);
      if (!workRequestSnapshot.exists) {
        return { ok: false, error: "Work request not found" };
      }
      const workRequest = workRequestSnapshot.data();
      if (!workRequest) return { ok: false, error: "Work request not found" };

      // verify user is developer in work request
      if (workRequest.developerId !== developerId) {
        return { ok: false, error: "Access denied" };
      }

      // verify status
      if (workRequest.status !== status) {
        return { ok: false, error: "Work request is wrong status" };
      }

      const declineRef = workRequestRef.collection("decline").doc("current");
      const declineSnapshot = await transaction.get(declineRef);

      // check if decline exists and whether description is changed
      let createdAt;
      if (declineSnapshot.exists) {
        const decline = declineSnapshot.data();
        const currentDescription = decline?.description ?? "";
        createdAt = decline?.createdAt;

        if (currentDescription.trim() === description.trim()) {
          return {
            ok: true,
            data: {
              message: "reason unchanged",
              unchanged: true,
            },
          };
        }
      }

      const now = new Date();

      transaction.set(
        declineRef,
        {
          description,
          authorId: developerId,
          createdAt: createdAt ?? now,
          updatedAt: now,
        },
        { merge: true },
      );

      return {
        ok: true,
        data: { message: "saved successfully", unchanged: false },
      };
    });
  } catch (error) {
    console.error("Failed to save decline reason:", error);
    return { ok: false, error: "Failed to save decline reason" };
  }
}
