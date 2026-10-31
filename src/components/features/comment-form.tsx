"use client";

import { useState } from "react";
import { addComment } from "@/src/lib/actions/add-comment";
import { Button } from "@/src/components/ui/button";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { TextArea } from "@/src/components/ui/text-area";

interface CommentFormProps {
  workRequestId: string;
}

export function CommentForm({ workRequestId }: CommentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setLoading(true);
    try {
      const result = await addComment(new FormData(form));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
    } catch {
      setError("We couldn't add your comment. Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="workRequestId" value={workRequestId} />
      <TextArea label="Add a comment" name="text" rows={3} required />
      <ErrorMessage message={error} />
      <Button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
}
