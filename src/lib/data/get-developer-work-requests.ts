import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import {
  WorkRequest,
  RequestGroup,
  statusGroups,
} from "@/src/types/work-request";
import { ActionResult } from "@/src/types/action-result";

export async function getRequestsForDeveloper(
  developerId: string,
  group: RequestGroup,
): Promise<ActionResult<(WorkRequest & { id: string })[]>> {
  try {
    const requestsSnapshot = await adminDb
      .collection("workRequests")
      .where("developerId", "==", developerId)
      .where("status", "in", [...statusGroups[group]])
      .get();

    const workRequests = requestsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...(data as WorkRequest),
        submittedAt: data.submittedAt.toDate(),
      };
    });

    return { ok: true, data: workRequests };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
