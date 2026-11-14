import { getCurrentDecline } from "@/src/lib/data/get-current-decline";
import { getCurrentProposal } from "@/src/lib/actions/get-current-proposal";
import { RequestDeclineOrProposalButtons } from "./request-decline-or-proposal-buttons";
import { WorkRequest } from "@/src/types/work-request";

interface RequestDeclineOrProposalProps {
  request: WorkRequest & { id: string };
}

export async function RequestDeclineOrProposal({
  request,
}: RequestDeclineOrProposalProps) {

  // get current decline reason, if exists
  let declineDescription: string = "";
  try {
    const response = await getCurrentDecline(request.id);
    if (response.ok) {
      declineDescription = response.data.description;
    } else {
      console.error("Failed to get decline", response.error);
    }
  } catch (error) {
    console.error("Failed to get decline", error);
  }

  // get current work proposal, if exists
  let proposalDescription: string = "";
  let proposalRevisionNumber = 1;
  try {
    const response = await getCurrentProposal(request.id);
    if (response.ok) {
      proposalDescription = response.data.description;
      if (response.data.revisionNumber > 0) {
        proposalRevisionNumber = response.data.revisionNumber;
      }
      if (response.data.hasChangeRequests) {
        proposalRevisionNumber += 1
      }
    } else {
      console.error("Failed to get proposal", response.error);
    }
  } catch (error) {
    console.error("Failed to get proposal", error);
  }

  return (
    <RequestDeclineOrProposalButtons
      requestId={request.id}
      requestStatus={request.status}
      declineDescription={declineDescription}
      proposalDescription={proposalDescription}
      proposalRevisionNumber={proposalRevisionNumber}
    />
  );
}
