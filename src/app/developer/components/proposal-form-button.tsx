"use client";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import ProposalForm from "./proposal-form";
import { getCurrentProposal } from "@/src/lib/actions/get-current-proposal";

export default function ProposalFormButton({
  requestId,
}: {
  requestId: string;
}) {
  const [formMode, setFormMode] = useState<"new" | "restore" | null>(null)
  const [initialDescription, setInitialDescription] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchCurrentProposal = async () => {
      setIsLoading(true);
      try {
        const response = await getCurrentProposal(requestId);

        if (ignore) return;

        if (response.ok) {
          const description = response.data?.description ?? "";
          setInitialDescription(description);
          setHasDraft(description.length > 0);
        } else {
          console.error("Failed to fetch current proposal", response.error);
          return;
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to fetch current proposal", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    fetchCurrentProposal();

    return () => {
      ignore = true;
    };
  }, [requestId]);

  return (
    <>
      {!formMode && (
        <div className="flex flex-col justify-center items-center gap-5">
          <Button
            onClick={() => {
              setFormMode("new");
            }}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Write Proposal"}
          </Button>
          {hasDraft && (
            <div className="flex flex-col justify-center items-center gap-2">
              <p>You have a previously saved draft.</p>
              <Button onClick={() => setFormMode("restore")}>
                Restore Previous Draft
              </Button>
            </div>
          )}
        </div>
      )}
      {formMode && (
        <ProposalForm
          requestId={requestId}
          onClose={() => setFormMode(null)}
          initialDescription={formMode === "restore" ? initialDescription: ""}
          onDraftSaved={(description) => {
            setInitialDescription(description);
            setHasDraft(true);
          }}
        />
      )}
    </>
  );
}
