"use client";
import { createWorkRequest } from "@/src/lib/actions/create-work-request";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkRequest({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSubmitted(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await createWorkRequest(formData);
      if (response.ok) {
        setSubmitted(true);
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
        className="relative flex flex-col justify-center items-center gap-4 w-full max-w-2xl bg-gray-300 p-5 rounded-lg"
      >
        <div className="absolute top-3 right-3">
          <Button
            type="button"
            onClick={() => {
              setSubmitted(false);
              onClose();
            }}
          >
            Close
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Work Request</h1>
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="title" className="font-bold">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g. Update the homepage layout"
              required
              className="w-full max-w-2xl"
            />
          </div>
          <div>
            <label htmlFor="description" className="font-bold">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              cols={50}
              placeholder="e.g. I'd like to update the homepage layout, replace the current banner image, and add a call-to-action button."
              required
              className="w-full max-w-2xl"
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
