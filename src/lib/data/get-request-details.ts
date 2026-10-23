import { adminDb } from "@/src/lib/firebase/admin";
import type { ActionResult } from "@/src/types/action-result";
import type { WorkRequest } from "@/src/types/work-request";

export async function getRequestDetails(
  workRequestId: string,
): Promise<ActionResult<(WorkRequest & { id: string }) | null>> {
  try {
    if (!workRequestId) {
      return { ok: true, data: null };
    }

    const doc = await adminDb
      .collection("workRequests")
      .doc(workRequestId)
      .get();

    if (!doc.exists) {
      return { ok: true, data: null };
    }

    const data = doc.data();

    if (!data) {
      return { ok: true, data: null };
    }

    const toDate = (value: unknown) => {
      if (
        typeof value === "object" &&
        value !== null &&
        "toDate" in value &&
        typeof (value as { toDate: unknown }).toDate === "function"
      ) {
        return (value as { toDate: () => Date }).toDate();
      }

      return new Date(value as string | number | Date);
    };

    return {
      ok: true,
      data: {
        id: doc.id,
        ...(data as WorkRequest),
        submittedAt: toDate(data.submittedAt),
        updatedAt: toDate(data.updatedAt),
      },
    };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
