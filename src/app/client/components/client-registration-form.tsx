"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/button";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { TextField } from "@/src/components/ui/text-field";
import { completeClientRegistration } from "@/src/lib/actions/create-client-invitations";

interface ClientRegistrationFormProps {
  uid: string;
  token: string;
  name: string;
  email: string;
}

export function ClientRegistrationForm({
  uid,
  token,
  name,
  email,
}: ClientRegistrationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await completeClientRegistration(
        uid,
        token,
        new FormData(event.currentTarget),
      );

      if (!result.ok) {
        setError(result.error);
        setSuccess(false);
      } else {
        setSuccess(true);
        setError(null);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-xl border-2 border-foreground p-6">
        <h1 className="mb-6 text-2xl font-bold">Client Registration</h1>
        {success ? (
          <div className="flex flex-col gap-5">
            <p className="text-success">
              Your account is ready. You can now sign in.
            </p>
            <Button href="/auth/login">Go to Login</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="client-name" className="text-sm font-medium">
                Full Name
              </label>
              <input id="client-name" value={name} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="client-email" className="text-sm font-medium">
                Email Address
              </label>
              <input id="client-email" type="email" value={email} readOnly />
            </div>
            <TextField
              label="Create Password"
              name="password"
              type="password"
              required
            />
            <ErrorMessage message={error} />
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
