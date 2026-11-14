"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { DeclineOrProposalForm } from "./decline-or-proposal-form";
import { WorkRequestStatus } from "@/src/types/work-request";
import { DeclineOrProposal } from "@/src/types/decline-or-proposal";

interface DeclineOrProposalFormButtonProps {
  requestId: string;
  showOtherButton: (showOther: boolean) => void;
  type: DeclineOrProposal;
  initialDescription: string;
  revisionNumber?: number;
  requestStatus: WorkRequestStatus;
  display: boolean;
}

export function DeclineOrProposalFormButton({
  requestId,
  showOtherButton,
  type,
  initialDescription: initialDesc,
  revisionNumber,
  display,
  requestStatus,
}: DeclineOrProposalFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialDescription, setInitialDescription] = useState(initialDesc);

  return (
    <div className={display ? "w-full" : "hidden"}>
      {!isOpen ? (
        <div className="flex flex-col gap-5 items-center">
          <Button
            onClick={() => {
              setIsOpen(true);
              showOtherButton(false);
            }}
          >
            {(initialDescription ? "Continue " : "Start ") + type}
          </Button>
          {initialDescription && <p>Saved draft exists</p>}
        </div>
      ) : (
        <DeclineOrProposalForm
          requestId={requestId}
          initialDescription={initialDescription}
          revisionNumber={revisionNumber}
          requestStatus={requestStatus}
          type={type}
          onClose={() => {
            setIsOpen(false);
            showOtherButton(true);
          }}
          onDraftSaved={(description) => {
            setInitialDescription(description);
          }}
        />
      )}
    </div>
  );
}
