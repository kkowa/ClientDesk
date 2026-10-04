"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/src/lib/auth/sign-in-up-out";
import Button from "@/src/components/ui/Button";


interface AuthFormProps {
  user: Record<string, any> | null;
}

export default function AuthForm({ user }: AuthFormProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    setLoading(true);
    const user = await signIn(email, password);
    setLoading(false);
    if (!user) {
      setError('Sign in failed');
      return;
    }
    router.push('/dashboard');
  }

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    setLoading(false);
    router.push('/');
  }

  return (
    <div>
      {error && <div className="text-error">{error}</div>}
      {user ? (
        <div className="flex flex-col gap-2">
          Signed in as {user.email}
          <Button type="button" onClick={handleSignOut} disabled={loading}>
            {loading ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSignIn}
          className="grid grid-cols-4 gap-2 w-fit"
        >
          <label htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="col-span-3"
          />
          <label htmlFor="password">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="col-span-3"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      )}
    </div>
  );
}
