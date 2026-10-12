"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { TextField } from "@/src/components/ui/text-field";
import { createClientInvitation } from "@/src/lib/actions/create-client-invitations";

type Invitation = {
  uid: string;
  token: string;
  clientName: string;
  clientEmail: string;
  developerName: string;
};

export function ClientAccountForm() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [message, setMessage] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await createClientInvitation(
        new FormData(event.currentTarget),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const link = `${window.location.origin}/client/registration?uid=${encodeURIComponent(result.data.uid)}&token=${encodeURIComponent(result.data.token)}`;
      setInvitation(result.data);
      setRegistrationLink(link);
      setMessage(
        `Hello ${result.data.clientName},\n\nPlease click the link below to register for an account. I look forward to working with you.\n\n${link}\n\nBest Regards,\n${result.data.developerName}`,
      );
    } catch {
      setError("We couldn't create the client account. Please try again");
    } finally {
      setLoading(false);
    }
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError(
        "Clipboard access is unavailable. Please copy the text manually",
      );
    }
  }

  function resetForm() {
    setInvitation(null);
    setMessage("");
    setRegistrationLink("");
    setError(null);
    setCopied(null);
    setClientName("");
    setClientEmail("");
  }

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-2 md:items-start md:gap-12">
      <div className="flex flex-col gap-5">
        <section className="rounded-xl border-2 border-foreground p-6">
          <h1 className="mb-6 text-2xl font-bold">Create Client Account</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField
              label="Client Full Name"
              name="name"
              required
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
            />
            <TextField
              label="Client Email"
              name="email"
              type="email"
              required
              value={clientEmail}
              onChange={(event) => setClientEmail(event.target.value)}
            />
            <ErrorMessage message={error} />
            {!invitation && (
              <Button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Client Account"}
              </Button>
            )}

            {invitation && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-black"
              >
                Create Another Client
              </button>
            )}
          </form>
        </section>

        {loading && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Creating client account"
            className="flex items-center justify-center py-5"
          >
            <div
              aria-hidden="true"
              className="relative size-28 animate-spin mt-24"
            >
              <span className="absolute left-1/2 top-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
              <span className="absolute left-[calc(50%+3rem)] top-1/4 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
              <span className="absolute left-[calc(50%+3rem)] top-3/4 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
              <span className="absolute left-1/2 top-full size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
              <span className="absolute left-[calc(50%-3rem)] top-3/4 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
              <span className="absolute left-[calc(50%-3rem)] top-1/4 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
            </div>
          </div>
        )}
      </div>

      {invitation && !loading && (
        <section className="flex flex-col gap-5 rounded-xl border-2 border-foreground p-6">
          <h2 className="text-xl font-bold">Registration Message</h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="client-email" className="text-sm font-medium">
              To
            </label>
            <div className="flex gap-2">
              <input
                id="client-email"
                value={invitation.clientEmail}
                readOnly
                className="min-w-0 flex-1"
              />
              <Button
                onClick={() => copyValue(invitation.clientEmail, "Email")}
              >
                Copy
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email-subject" className="text-sm font-medium">
              Subject
            </label>
            <div className="flex gap-2">
              <input
                id="email-subject"
                value="ClientDesk Account Registration"
                readOnly
                className="min-w-0 flex-1"
              />
              <Button
                onClick={() =>
                  copyValue("ClientDesk Account Registration", "Subject")
                }
              >
                Copy
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email-message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="email-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={10}
              className="w-full resize-y"
            />
            <Button onClick={() => copyValue(message, "Message")}>
              Copy Message
            </Button>
          </div>
          {copied && (
            <p role="status" className="text-sm text-success">
              {copied} copied
            </p>
          )}
          <p className="break-all text-sm text-muted">
            Registration link: {registrationLink}
          </p>
        </section>
      )}
    </main>
  );
}
