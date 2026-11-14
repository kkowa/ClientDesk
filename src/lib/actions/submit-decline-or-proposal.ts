"use server";

import { adminDb } from "@/src/lib/firebase/admin";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { ActionResult } from "@/src/types/action-result";
import { WorkRequestStatus } from "@/src/types/work-request";
import { DeclineOrProposal } from "@/src/types/decline-or-proposal";
import { revalidatePath } from "next/cache";

export async function submitDeclineOrProposal(
  requestId: string,
  type: DeclineOrProposal,
): Promise<ActionResult<string>> {
  // Check if user is developer
  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    return { ok: false, error: "Access denied" };
  }
  const developerId = developerResult.data;

  try {
    // get work request
    const workRequestRef = adminDb.collection("workRequests").doc(requestId);
    const workRequestSnapshot = await workRequestRef.get();
    if (!workRequestSnapshot.exists) {
      return { ok: false, error: "Work request not found" };
    }
    const workRequest = workRequestSnapshot.data();
    if (!workRequest) {
      return { ok: false, error: "Work request empty" };
    }

    if (workRequest.developerId !== developerId) {
      return { ok: false, error: "Access denied" };
    }

    // check for appropriate work request status
    if (
      workRequest.status !== WorkRequestStatus.Open &&
      workRequest.status !== WorkRequestStatus.ChangeRequested
    ) {
      return { ok: false, error: "Invalid status" };
    }

    if (type === DeclineOrProposal.Proposal) {
      // get current proposal
      const proposalRef = workRequestRef.collection("proposals").doc("current");
      const proposalsSnapshot = await proposalRef.get();
      if (!proposalsSnapshot.exists) {
        return { ok: false, error: "Proposal not found" };
      }
      const proposal = proposalsSnapshot.data();
      if (!proposal) {
        return { ok: false, error: "Proposal empty" };
      }

      // get current revision
      const currentRevisionId = proposal.currentRevisionId;
      const revisionRef = proposalRef
        .collection("revisions")
        .doc(currentRevisionId);
      const revisionSnapshot = await revisionRef.get();
      if (!revisionSnapshot.exists) {
        return { ok: false, error: "Current revision not found" };
      }

      return await adminDb.runTransaction(async (transaction) => {
        // update submittedAt
        await transaction.update(revisionRef, { submittedAt: new Date() });

        await transaction.update(workRequestRef, {
          status: WorkRequestStatus.AwaitingApproval,
        });

        revalidatePath(`/developer/requests/${requestId}`);
        revalidatePath(`/client/requests/${requestId}`);
        return { ok: true, data: "Proposal submitted" };
      });

    } else if (type === DeclineOrProposal.Decline) {
      // get current decline
      const declineRef = workRequestRef.collection("decline").doc("current");
      const declineSnapshot = await declineRef.get();
      if (!declineSnapshot.exists) {
        return { ok: false, error: "Decline not found" };
      }
      const decline = declineSnapshot.data();
      if (!decline) {
        return { ok: false, error: "Decline empty" };
      }

      return await adminDb.runTransaction(async (transaction) => {
        // update submittedAt
        await transaction.update(declineRef, { submittedAt: new Date() });

        await transaction.update(workRequestRef, {
          status: WorkRequestStatus.Declined,
        });

        revalidatePath(`/developer/requests/${requestId}`);
        revalidatePath(`/client/requests/${requestId}`);
        return { ok: true, data: "Decline submitted" };
      });

    } else {
      return { ok: false, error: "Invalid type" };
    }
  } catch (e) {
    console.error("Failed to set revision submittedAt", e);
  }

  return { ok: false, error: "Failed to submit" };
}
