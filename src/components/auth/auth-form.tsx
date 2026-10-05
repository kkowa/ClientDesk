"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/src/lib/auth/sign-in-up-out";
import { Button } from "@/src/components/ui/button";
import type { ServerUser } from "@/src/types/server-user";
import { Role } from "@/src/types/role";


interface AuthFormProps {
  serverUser: ServerUser | null;
}

export default function AuthForm({ serverUser }: AuthFormProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Sign in failed');
      return;
    }
    const user = result.data;

    let role: Role;
    try {
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;

      if (!claims.role) {
        throw new Error("Role claim is missing");
      } else {
        if (claims.role === Role.Developer || claims.role === Role.Client) {
          role = claims.role;
        } else {
          throw new Error("Invalid role claim");
        }
      }
    } catch (error) {
      setError(`Error fetching role: ${error}`);
      return;
    }
    if (role) {
      router.push(`/${role}/dashboard`);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    setLoading(false);
    router.push('/auth/login');
  }

  return (
    <div>
      {error && <div className="text-error">{error}</div>}
      {serverUser ? (
        <div className="flex flex-col justify-center items-center gap-2">
          Signed in as {serverUser.email}
          <Button type="button" onClick={() => router.push(`/${serverUser.role}/dashboard`)}>
            Continue to Dashboard
          </Button>
          <div>
            or
          </div>
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
          <div className="col-span-4 flex justify-center">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
