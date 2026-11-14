"use client";
import { useState } from "react";
import { DeclineOrProposalFormButton } from "@/src/app/developer/components/decline-or-proposal-form-button";
import { WorkRequestStatus } from "@/src/types/work-request";
import { DeclineOrProposal } from "@/src/types/decline-or-proposal";

interface RequestDeclineOrProposalButtonsProps {
  requestId: string;
  requestStatus: WorkRequestStatus;
  declineDescription: string;
  proposalDescription: string;
  proposalRevisionNumber: number;
}

export function RequestDeclineOrProposalButtons({
  requestId,
  requestStatus,
  declineDescription,
  proposalDescription,
  proposalRevisionNumber,
}: RequestDeclineOrProposalButtonsProps) {
  const [showDeclineButton, setShowDeclineButton] = useState(true);
  const [showProposalButton, setShowProposalButton] = useState(true);

  const declineClicked = (showProposal: boolean) =>
    setShowProposalButton(showProposal);
  const proposalClicked = (showDecline: boolean) =>
    setShowDeclineButton(showDecline);

  return (
    <div className="flex items-start justify-center gap-4 w-full">
      <DeclineOrProposalFormButton
        requestId={requestId}
        showOtherButton={declineClicked}
        type={DeclineOrProposal.Decline}
        initialDescription={declineDescription}
        requestStatus={requestStatus}
        display={showDeclineButton}
      />

      {showDeclineButton && showProposalButton && (
        <div
          role="separator"
          aria-orientation="vertical"
          className="flex flex-col items-center self-stretch"
        >
          <div className="w-px flex-1 bg-border" />
          <span className="py-2 text-sm text-muted">or</span>
          <div className="w-px flex-1 bg-border" />
        </div>
      )}

      <DeclineOrProposalFormButton
        requestId={requestId}
        showOtherButton={proposalClicked}
        type={DeclineOrProposal.Proposal}
        initialDescription={proposalDescription}
        revisionNumber={proposalRevisionNumber}
        requestStatus={requestStatus}
        display={showProposalButton}
      />
    </div>
  );
}
