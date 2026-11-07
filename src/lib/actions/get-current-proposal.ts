"use server";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { adminDb } from "../firebase/admin";

export async function getCurrentProposal(requestId: string) {
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

    if (!proposalSnap.exists) {
      return { ok: true, data: null };
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

    return { ok: true, data: { description: revision?.description ?? "" } };
  } catch (error) {
    console.error("Error retrieving current proposal:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}
