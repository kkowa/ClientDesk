"use client"

import Link from "next/link";
import { Button, LinkButton } from "@/src/components/ui/button";
import { registerDeveloper } from "@/src/lib/actions/developer-registration";
import { useState } from "react";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { TextField } from "@/src/components/ui/text-field";


export default function Page() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // clear error/success state in case user retries after error
    setError(null);
    setSuccess(null);

    setLoading(true);
    const result = await registerDeveloper(formData);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setSuccess(null);
    } else {
      setSuccess(result.data);
      setError(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold">
        Developer Registration
      </h1>
      {success ? (
        <>
          <p className="text-success">{success}</p>
          <Link href="/auth/login">
            <LinkButton>
              Login
            </LinkButton>
          </Link>
        </>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <TextField
              label="Full Name"
              name="name"
              type="text"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              required
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>
        </>
      )}
      {error && (
        <>
        <ErrorMessage message={error}/>
        <p>Please try again.</p>
        </>
      )}
    </div>
  );
}
