"use client";
import { useRef, useState } from "react";
import { saveDeclineDraft } from "@/src/lib/actions/save-decline-draft";
import { saveProposalDraft } from "@/src/lib/actions/save-proposal-draft";
import { DeclineOrProposal } from "@/src/types/decline-or-proposal";
import { Button } from "@/src/components/ui/button";
import { TextArea } from "@/src/components/ui/text-area";
import { Card } from "@/src/components/ui/card";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { WorkRequestStatus } from "@/src/types/work-request";
import { submitDeclineOrProposal } from "@/src/lib/actions/submit-decline-or-proposal";

interface DeclineOrProposalFormProps {
  requestId: string;
  type: DeclineOrProposal;
  onClose: () => void;
  initialDescription: string;
  revisionNumber?: number;
  requestStatus: WorkRequestStatus;
  onDraftSaved: (description: string) => void;
}

export function DeclineOrProposalForm({
  requestId,
  type,
  onClose,
  initialDescription,
  revisionNumber,
  requestStatus,
  onDraftSaved,
}: DeclineOrProposalFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [savedDescription, setSavedDescription] = useState(initialDescription);

  const handleClose = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleSaveDraft = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const formValue = formData.get("description");
    const savedDescription = typeof formValue === "string" ? formValue : "";
    setIsSaving(true);
    setSuccess(null);
    setError(null);
    try {
      let response;
      switch (type) {
        case DeclineOrProposal.Decline:
          response = await saveDeclineDraft(requestId, formData);
          break;
        case DeclineOrProposal.Proposal:
          response = await saveProposalDraft(requestId, formData);
          break;
      }
      if (!response.ok) {
        setError(response.error);
      } else if (response.data.unchanged === true) {
        setSuccess("No changes detected. Your draft is already up to date.");
        setError(null);
      } else {
        setSuccess("Draft saved");
        setError(null);
        onDraftSaved(savedDescription);
        setSavedDescription(savedDescription);
      }
    } catch (error) {
      setError("Failed to save draft: " + error);
      setSuccess(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!savedDescription.trim() || savedDescription.trim() !== description.trim()) {
      setError("Save draft before submitting.");
      return;
    }
    const result = await submitDeclineOrProposal(requestId, type);
    if (!result.ok) {
      setError(result.error);
    } else {
      setSuccess(result.data);
    }
  };

  let title, label, placeholder;
  switch (type) {
    case DeclineOrProposal.Decline:
      title = "Decline Request";
      label = "Decline Reason";
      placeholder = "Reason for declining";
      break;
    case DeclineOrProposal.Proposal:
      title = "Propose Work";
      label = "Proposal Description";
      placeholder = "Describe your proposal";
      break;
  }

  return (
    <Card>
      <form
        ref={formRef}
        className="relative flex flex-col justify-center items-center gap-4"
      >
        <div className="absolute top-0 right-0">
          <Button
            onClick={() => {
              handleClose();
            }}
            type="button"
          >
            Close
          </Button>
        </div>
        <h2 className="font-bold text-2xl">{title}</h2>
        <div className="text-start w-full">
          <input type="hidden" name="revision" value={revisionNumber} />
          <input type="hidden" name="status" value={requestStatus} />
          <TextArea
            label={label}
            name="description"
            placeholder={placeholder}
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="w-full flex justify-between gap-4">
          <Button
            type="button"
            onClick={() => {
              if (formRef.current) {
                if (formRef.current.reportValidity()) {
                  handleSaveDraft(formRef.current);
                }
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>

          {/* change it to type="submit" when you have implemented the submit handler */}
          <Button type="button" onClick={handleSubmit}>
            Submit
          </Button>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <p>{success}</p>}
      </form>
    </Card>
  );
}
