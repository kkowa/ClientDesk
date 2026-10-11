"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/src/lib/auth/sign-in-up-out";
import { Button } from "@/src/components/ui/button";


export function SignOutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
    } finally {
      setLoading(false);
    }
    router.push("/auth/login");
  }

  return (
    <Button type="button" onClick={handleSignOut} disabled={loading}>
      {loading ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
