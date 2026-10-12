"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/src/lib/auth/sign-in-up-out";
import { Button } from "@/src/components/ui/button";
import { ErrorMessage } from "@/src/components/ui/error-message";


export function SignOutButton() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    // reset error state in case user is retrying
    setError(null);

    setLoading(true);
    try {
      const result = await signOut();
      if (!result.ok) {
        setLoading(false);
        setError("Error signing out, please try again");
        return;
      }
    } catch {
      setLoading(false);
      setError("Error signing out, please try again");
      return;
    }
    setLoading(false);
    router.push('/auth/login');
  }

  return (
    <>
      <Button type="button" onClick={handleSignOut} disabled={loading}>
        {loading ? "Signing Out..." : "Sign Out"}
      </Button>
      {error && <ErrorMessage message={error} />}
    </>
  );
}
