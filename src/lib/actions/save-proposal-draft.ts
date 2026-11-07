"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { proposalSchema } from "@/src/lib/validation/proposal";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { ActionResult } from "@/src/types/action-result";
import { WorkRequestStatus } from "@/src/types/work-request";

export async function saveProposalDraft(
  requestId: string,
  formData: FormData,
): Promise<ActionResult<{ revisionId: string; unchanged: boolean }>> {
  const developerResult = await requireDeveloperId();

  // Check if the developer is authorized to access this work request
  // and extract the developer ID from the result
  if (!developerResult.ok) {
    return { ok: false, error: "Access denied" };
  }
  const developerId = developerResult.data;

  // Validate the proposal, verify request ownership and status, and save the revision transactionally.
  try {
    const workRequestRef = adminDb.collection("workRequests").doc(requestId);

    const result = proposalSchema.safeParse({
      description: formData.get("description"),
    });

    if (!result.success) {
      return { ok: false, error: "Proposal description is required" };
    }

    const { description } = result.data;

    const proposalRef = workRequestRef.collection("proposals").doc("current");

    const revisionRef = proposalRef.collection("revisions").doc();

    return await adminDb.runTransaction(async (transaction) => {
      const workRequestSnapshot = await transaction.get(workRequestRef);
      const proposalsSnapshot = await transaction.get(proposalRef);

      if (!workRequestSnapshot.exists) {
        return { ok: false, error: "Work request not found" };
      }

      const workRequest = workRequestSnapshot.data();

      if (workRequest?.developerId !== developerId) {
        return { ok: false, error: "Access denied" };
      }

      if (workRequest?.status !== WorkRequestStatus.Open) {
        return { ok: false, error: "Work request is not open" };
      }

      let revisionNumber = 1;
      if (proposalsSnapshot.exists) {
        const proposal = proposalsSnapshot.data();
        const currentRevisionId = proposal?.currentRevisionId;
        if (!currentRevisionId) {
          throw new Error("Current revision ID not found");
        }

        const currentRevisionRef = proposalRef
          .collection("revisions")
          .doc(currentRevisionId);

        const currentRevisionSnapshot =
          await transaction.get(currentRevisionRef);

        if (currentRevisionSnapshot.exists) {
          const currentRevision = currentRevisionSnapshot.data();

          const currentDescription = currentRevision?.description ?? "";

          if (currentDescription.trim() === description.trim()) {
            return {
              ok: true,
              data: {
                revisionId: currentRevisionId,
                unchanged: true,
              },
            };
          }

          revisionNumber = (currentRevision?.revisionNumber ?? 0) + 1;
        } else {
          throw new Error("Current proposal revision not found");
        }
      }
      const now = new Date();

      transaction.create(revisionRef, {
        revisionNumber,
        description,
        authorId: developerId,
        createdAt: now,
      });

      const createdAt = proposalsSnapshot.exists
        ? (proposalsSnapshot.data()?.createdAt ?? now)
        : now;

      const acceptedRevisionId = proposalsSnapshot.exists
        ? (proposalsSnapshot.data()?.acceptedRevisionId ?? null)
        : null;

      transaction.set(proposalRef, {
        currentRevisionId: revisionRef.id,
        acceptedRevisionId,
        createdAt,
        updatedAt: now,
      });

      return {
        ok: true,
        data: { revisionId: revisionRef.id, unchanged: false },
      };
    });
  } catch (error) {
    console.error("Failed to save proposal draft:", error);
    return { ok: false, error: "Failed to save proposal draft" };
  }
}
