"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { proposalSchema } from "@/src/lib/validation/proposal";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { ActionResult } from "@/src/types/action-result";

export async function saveProposalDraft(
  requestId: string,
  formData: FormData,
): Promise<ActionResult<{ revisionId: string; unchanged: boolean }>> {
  const developerResult = await requireDeveloperId();

  // Check if user is a developer and extract the developer ID from the result
  if (!developerResult.ok) {
    return { ok: false, error: "Access denied" };
  }
  const developerId = developerResult.data;

  // Validate the proposal
  try {
    const result = proposalSchema.safeParse({
      description: formData.get("description"),
      status: formData.get("status"),
      revision: formData.get("revision")
    });
    if (!result.success) {
      return { ok: false, error: result.error.issues[0].message };
    }
    const { description, status, revision } = result.data;

    const workRequestRef = adminDb.collection("workRequests").doc(requestId);

    const proposalRef = workRequestRef.collection("proposals").doc("current");

    // assume creating a new doc until checking for current revision
    let revisionRef = proposalRef.collection("revisions").doc();

    // Verify request ownership and status, and save the revision transactionally.
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

      if (workRequest?.status !== status) {
        return { ok: false, error: "Work request is wrong status" };
      }

      const revisionNumber = revision;
      if (proposalsSnapshot.exists) {
        const proposal = proposalsSnapshot.data();
        const currentRevisionId = proposal?.currentRevisionId;
        if (!currentRevisionId) {
          throw new Error("Current revision ID not found");
        }

        // update ref if current revision exists
        revisionRef = proposalRef
          .collection("revisions")
          .doc(currentRevisionId);

        const currentRevisionSnapshot =
          await transaction.get(revisionRef);

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

        } else {
          throw new Error("Current proposal revision not found");
        }
      }
      const now = new Date();

      // create or update this revision
      transaction.set(revisionRef, {
        revisionNumber,
        description,
        authorId: developerId,
        createdAt: now,
        submittedAt: null,
      }, {merge: true});

      const createdAt = proposalsSnapshot.exists
        ? (proposalsSnapshot.data()?.createdAt ?? now)
        : now;

      // no accepted revision yet
      const acceptedRevisionId = null;

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
