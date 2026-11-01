"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/src/lib/firebase/admin";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { requireClientId } from "@/src/lib/access-checks/require-client-id";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import {
  CommentImageUploadError,
  deleteCommentImage,
  uploadCommentImage,
} from "@/src/lib/cloudinary/comment-image";
import { CommentSchema } from "@/src/lib/validation/comment";
import type { ActionResult } from "@/src/types/action-result";
import { Role } from "@/src/types/role";

export async function addComment(
  formData: FormData,
): Promise<ActionResult<string>> {
  const requestIdValue = formData.get("workRequestId");
  if (
    typeof requestIdValue !== "string" ||
    !requestIdValue.trim() ||
    requestIdValue.includes("/")
  ) {
    return { ok: false, error: "A valid work request is required" };
  }

  const parsedComment = CommentSchema.safeParse({
    text: formData.get("text"),
  });
  if (!parsedComment.success) {
    return { ok: false, error: "Enter a valid comment" };
  }

  const imageValue = formData.get("image");
  if (imageValue !== null && !(imageValue instanceof File)) {
    return { ok: false, error: "Choose a valid image" };
  }
  const imageFile =
    imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

  if (!parsedComment.data.text && !imageFile) {
    return { ok: false, error: "Add a comment or a picture" };
  }

  try {
    const user = await getServerUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to comment" };
    }

    const requestRef = adminDb
      .collection("workRequests")
      .doc(requestIdValue.trim());
    const requestSnapshot = await requestRef.get();
    const request = requestSnapshot.data();
    if (
      !requestSnapshot.exists ||
      !request ||
      typeof request.clientId !== "string" ||
      typeof request.developerId !== "string"
    ) {
      return { ok: false, error: "Work request not found" };
    }

    let authorId: string;
    if (user.role === Role.Client) {
      const clientResult = await requireClientId(user, request.clientId);
      if (!clientResult.ok || clientResult.data !== request.clientId) {
        return {
          ok: false,
          error: "You don't have access to this work request",
        };
      }
      authorId = clientResult.data;
    } else if (user.role === Role.Developer) {
      const developerResult = await requireDeveloperId(user);
      if (!developerResult.ok || developerResult.data !== request.developerId) {
        return {
          ok: false,
          error: "You don't have access to this work request",
        };
      }
      authorId = developerResult.data;
    } else {
      return { ok: false, error: "You don't have access to this work request" };
    }

    const image = imageFile ? await uploadCommentImage(imageFile) : undefined;
    let commentRef;
    try {
      commentRef = await adminDb.collection("comments").add({
        workRequestId: requestSnapshot.id,
        authorId,
        authorRole: user.role,
        text: parsedComment.data.text,
        ...(image ? { image } : {}),
        createdAt: new Date(),
      });
    } catch (error) {
      if (image) {
        try {
          await deleteCommentImage(image.publicId);
        } catch (cleanupError) {
          console.error("Failed to clean up uploaded comment image:", cleanupError);
        }
      }
      throw error;
    }

    revalidatePath(`/client/requests/${requestSnapshot.id}`);
    revalidatePath(`/developer/requests/${requestSnapshot.id}`);

    return { ok: true, data: commentRef.id };
  } catch (error) {
    console.error("Failed to add comment:", error);
    if (error instanceof CommentImageUploadError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Failed to add comment" };
  }
}
