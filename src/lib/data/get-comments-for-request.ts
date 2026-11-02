import "server-only";

import { adminDb } from "@/src/lib/firebase/admin";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { requireClientId } from "@/src/lib/access-checks/require-client-id";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { Role } from "@/src/types/role";
import type { ActionResult } from "@/src/types/action-result";
import { getUserContact } from "@/src/lib/data/get-user-contact";
import type { Comment, CommentWithAuthor } from "@/src/types/comment";

export async function getCommentsForRequest(
  workRequestId: string,
): Promise<ActionResult<CommentWithAuthor[]>> {
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

    // sorted below rather than with orderBy, which would need a composite Firestore index
    const commentsSnapshot = await adminDb
      .collection("comments")
      .where("workRequestId", "==", requestSnapshot.id)
      .get();

    const docs = commentsSnapshot.docs.map((commentDoc) => ({
      id: commentDoc.id,
      data: commentDoc.data(),
    }));

    // a request only has two authors, so look each one up once
    const authorNames = new Map<string, string>();
    for (const { data } of docs) {
      if (!authorNames.has(data.authorId)) {
        const contact = await getUserContact(data.authorId, data.authorRole);
        authorNames.set(data.authorId, contact.ok ? contact.data.name : "Unknown");
      }
    }

    const comments = docs
      .map(({ id, data }) => ({
        ...(data as Omit<Comment, "createdAt">),
        id,
        authorName: authorNames.get(data.authorId) ?? "Unknown",
        createdAt: data.createdAt.toDate() as Date,
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return { ok: true, data: comments };
  } catch (error) {
    console.error("Failed to get comments for work request:", error);
    return { ok: false, error: "Failed to load comments" };
  }
}