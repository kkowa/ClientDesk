"use client";
import { createWorkRequest } from "@/src/lib/actions/create-work-request";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/src/components/ui/text-field";
import { TextArea } from "@/src/components/ui/text-area";

export default function WorkRequest({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await createWorkRequest(formData);
      if (response.ok) {
        form.reset();
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
      {error && <p className="text-red-500">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col justify-center items-center gap-4 w-full max-w-2xl bg-muted p-5 rounded-lg"
      >
        <div className="absolute top-3 right-3">
          <Button
            type="button"
            onClick={() => { onClose(); }}
          >
            Close
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Work Request</h1>
        <div className="flex flex-col gap-4 w-full">
          <div>
            <TextField
              label="Title"
              name="title"
              type="text"
              required
            />
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </div>
  );
}
