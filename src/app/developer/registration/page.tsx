"use client"

import Link from "next/link";
import { Button, LinkButton } from "@/src/components/ui/button";
import { registerDeveloper } from "@/src/lib/actions/developer-registration";
import { useState } from "react";


export default function Page() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // clear state in case user retries after error
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
            className="grid grid-cols-4 gap-2"
          >

            <label className="col-span-1">
              Full Name:
            </label>
            <input type="text" name="name" className="col-span-3" required />

            <label className="col-span-1">
              Email:
            </label>
            <input type="email" name="email" className="col-span-3" required />

            <label className="col-span-1">
              Password:
            </label>
            <input type="password" name="password" className="col-span-3" required />

            <div className="col-span-4 flex justify-center">
              <Button
                type="submit"
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>

          </form>
        </>
      )}
      {error && (
        <>
          <p className="text-error">{error}</p>
          <p>Please try again.</p>
        </>
      )}
    </div>
  );
}
