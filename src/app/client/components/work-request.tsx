"use client";
import { createWorkRequest } from "@/src/lib/actions/create-work-request";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/src/components/ui/text-field";
import { TextArea } from "@/src/components/ui/text-area";

interface WorkRequestProps {
  onClose: () => void;
}

export default function WorkRequest({ onClose }: WorkRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setPendingFormData(formData);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!pendingFormData) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await createWorkRequest(pendingFormData);
      if (response.ok) {
        setPendingFormData(null);
        setShowConfirmation(false);
        router.refresh();
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error submitting work request:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-error">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col justify-center items-center gap-4 w-full max-w-2xl bg-muted p-5 rounded-lg"
      >
        <div className="absolute top-3 right-3">
          <Button
            type="button"
            onClick={() => {
              onClose();
            }}
          >
            Close
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Work Request</h1>
        <div className="flex flex-col gap-4 w-full">
          <div>
            <TextField label="Title" name="title" type="text" required />
          </div>
          <div>
            <TextArea
              label="Description"
              name="description"
              placeholder="e.g. I'd like to update the homepage layout, replace the current banner image, and add a call-to-action button."
              required
            />
          </div>
        </div>
        {showConfirmation ? (
          <div className="flex flex-col items-center gap-4">
            <p>Are you sure you want to submit this work request?</p>
            <div className="flex gap-4">
              <Button type="button" onClick={() => setShowConfirmation(false)}>
                Go Back
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm Submission"}
              </Button>
            </div>
          </div>
        ) : (
          <Button type="submit">Submit Request</Button>
        )}
      </form>
    </div>
  );
}
