"import server-only";

import { ActionResult } from "@/src/types/action-result";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { adminDb } from "@/src/lib/firebase/admin";

export async function getCurrentDecline(requestId: string): Promise<
  ActionResult<{
    description: string;
    submittedAt: Date | null;
  }>
> {
  try {
    const result = await requireDeveloperId();
    if (!result.ok) {
      return { ok: false, error: "Access denied" };
    }
    const developerId = result.data;

    // Verify ownership of work request
    const requestRef = adminDb.collection("workRequests").doc(requestId);

    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return { ok: false, error: "Work request not found" };
    }
    const requestData = requestSnap.data();
    if (!requestData) {
      return { ok: false, error: "Work request not found" };
    }

    if (requestData.developerId !== developerId) {
      return { ok: false, error: "Access denied" };
    }

    // Get the current decline for the work request
    const declineRef = requestRef.collection("decline").doc("current");

    const declineSnap = await declineRef.get();

    // if decline doesn't exist, return ok with empty data
    if (!declineSnap.exists) {
      return { ok: true, data: { description: "", submittedAt: null } };
    }

    // if decline exists but data is empty, return error
    const declineData = declineSnap.data();
    if (!declineData) {
      return { ok: false, error: "Decline data empty" };
    }

    return {
      ok: true,
      data: {
        description: declineData.description,
        submittedAt: declineData.submittedAt
          ? declineData.submittedAt.toDate()
          : null,
      },
    };
  } catch (error) {
    console.error("Error retrieving current decline:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}
