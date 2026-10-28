import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { requireClientId } from "@/src/lib/access-checks/require-client-id";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { Role } from "@/src/types/role";
import type { ActionResult } from "@/src/types/action-result";
import type { Comment } from "@/src/types/comment";

export async function getCommentsForRequest(
  workRequestId: string,
): Promise<ActionResult<Comment[]>> {
  if (!workRequestId.trim() || workRequestId.includes("/")) {
    return { ok: false, error: "A valid work request is required" };
  }

  try {
    const user = await getServerUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to view comments" };
    }

    const requestSnapshot = await adminDb
      .collection("workRequests")
      .doc(workRequestId.trim())
      .get();
    const request = requestSnapshot.data();

    if (
      !requestSnapshot.exists ||
      !request ||
      typeof request.clientId !== "string" ||
      typeof request.developerId !== "string"
    ) {
      return { ok: false, error: "Work request not found" };
    }

    if (user.role === Role.Client) {
      const clientResult = await requireClientId(user, request.clientId);
      if (!clientResult.ok || clientResult.data !== request.clientId) {
        return {
          ok: false,
          error: "You don't have access to this work request",
        };
      }
    } else if (user.role === Role.Developer) {
      const developerResult = await requireDeveloperId(user);
      if (!developerResult.ok || developerResult.data !== request.developerId) {
        return {
          ok: false,
          error: "You don't have access to this work request",
        };
      }
    } else {
      return {
        ok: false,
        error: "You don't have access to this work request",
      };
    }

    const commentsSnapshot = await adminDb
      .collection("comments")
      .where("workRequestId", "==", requestSnapshot.id)
      .orderBy("createdAt", "asc")
      .get();

    const comments = commentsSnapshot.docs.map((commentDoc) => {
      const data = commentDoc.data();
      return {
        ...(data as Omit<Comment, "createdAt">),
        createdAt: data.createdAt.toDate(),
      };
    });

    return { ok: true, data: comments };
  } catch (error) {
    console.error("Failed to get comments for work request:", error);
    return { ok: false, error: "Failed to load comments" };
  }
}