"use client";
import { Button } from "@/src/components/ui/button";
import { TextArea } from "@/src/components/ui/text-area";
import { useRef, useState } from "react";
import { saveProposalDraft } from "@/src/lib/actions/save-proposal-draft";

type ProposalFormProps = {
  requestId: string;
  onClose: () => void;
  initialDescription?: string;
  onDraftSaved: (description: string) => void;
};

export default function ProposalForm({
  requestId,
  onClose,
  initialDescription = "",
  onDraftSaved,
}: ProposalFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState(initialDescription);

  const handleClose = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setError(null);
    setSuccess(null);
    setDescription(initialDescription);
    onClose();
  };

  const handleSaveDraft = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const formValue = formData.get("description");
    const savedDescription = typeof formValue === "string" ? formValue : "";
    setSuccess(null);
    setIsSaving(true);
    setError(null);
    try {
      const response = await saveProposalDraft(requestId, formData);
      if (!response.ok) {
        setError(response.error);
      } else if(response.data.unchanged){
        setSuccess("No changes detected. Your draft is already up to date.");
        setError(null);
      }
      else {
        setSuccess("Draft saved successfully");
        setError(null);
        onDraftSaved(savedDescription);
      }
    } catch (error) {
      setError("Failed to save draft: " + error);
      setSuccess(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="relative w-full flex flex-col justify-between items-center">
        <form
          ref={formRef}
          className="relative bg-surface border border-border flex flex-col justify-center items-center gap-4 w-full p-5 rounded-lg"
        >
          <div className="absolute top-3 right-3">
            <Button
              onClick={() => {
                handleClose();
              }}
              type="button"
            >
              Close
            </Button>
          </div>
          <h2 className="font-bold text-2xl">Proposed Work</h2>
          <div className="text-start w-full">
            <TextArea
              label="Proposal Description"
              name="description"
              placeholder="Describe your proposed work"
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
            <Button type="button">Submit Proposal</Button>
          </div>

          {error && <p>{error}</p>}
          {success && <p>{success}</p>}
        </form>
      </div>
    </>
  );
}
