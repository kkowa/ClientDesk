import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { requireClientId } from "@/src/lib/access-checks/require-client-id";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { Role } from "@/src/types/role";
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

    const user = await getServerUser();
    if (!user) {
      return { ok: true, data: null };
    }

    if (user.role === Role.Client) {
      const clientResult = await requireClientId(user, data.clientId);
      if (!clientResult.ok) {
        return { ok: true, data: null };
      }
    } else if (user.role === Role.Developer) {
      const developerResult = await requireDeveloperId(user);
      if (!developerResult.ok || developerResult.data !== data.developerId) {
        return { ok: true, data: null };
      }
    } else {
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
