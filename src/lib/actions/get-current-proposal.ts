"use server";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { adminDb } from "@/src/lib/firebase/admin";
import { ActionResult } from "@/src/types/action-result";

export async function getCurrentProposal(requestId: string): Promise<
  ActionResult<{
    description: string;
    revisionNumber: number;
    submittedAt: Date | null;
    hasChangeRequests: boolean;
  }>
> {
  try {
    const developerResult = await requireDeveloperId();
    if (!developerResult.ok) {
      return { ok: false, error: "Access denied" };
    }
    const developerId = developerResult.data;

    //   Verify ownership of work request
    const requestRef = adminDb.collection("workRequests").doc(requestId);

    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return { ok: false, error: "Work request not found" };
    }

    const requestData = requestSnap.data();

    if (requestData?.developerId !== developerId) {
      return { ok: false, error: "Access denied" };
    }

    //   Get the current proposal for the work request
    const proposalRef = requestRef.collection("proposals").doc("current");

    const proposalSnap = await proposalRef.get();

    // return empty data, but not an error
    if (!proposalSnap.exists) {
      return {
        ok: true,
        data: {
          description: "",
          revisionNumber: 0,
          submittedAt: null,
          hasChangeRequests: false,
        },
      };
    }

    const proposalData = proposalSnap.data();

    if (!proposalData?.currentRevisionId) {
      return { ok: false, error: "Current revision not found" };
    }

    const revisionSnap = await proposalRef
      .collection("revisions")
      .doc(proposalData.currentRevisionId)
      .get();

    if (!revisionSnap.exists) {
      return { ok: false, error: "Revision not found" };
    }
    const revision = revisionSnap.data();
    if (!revision) {
      return { ok: false, error: "Revision not found" };
    }

    const changeRequestsSnap = await proposalRef
      .collection("revisions")
      .doc(proposalData.currentRevisionId)
      .collection("changeRequests")
      .limit(1)
      .get();

    return {
      ok: true,
      data: {
        description: revision.description,
        revisionNumber: revision.revisionNumber,
        submittedAt: revision.submittedAt
          ? revision.submittedAt.toDate()
          : null,
        hasChangeRequests: !changeRequestsSnap.empty,
      },
    };
  } catch (error) {
    console.error("Error retrieving current proposal:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}
