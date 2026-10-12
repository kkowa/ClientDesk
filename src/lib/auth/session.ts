"use server"

import { cookies } from "next/headers";
import { adminAuth } from "@/src/lib/firebase/admin";
import type { ActionResult } from "@/src/types/action-result";
import { getServerUser } from "./auth-server";


export async function createSession(idToken: string): Promise<ActionResult<{ status: string }>> {

  // Verify the ID token
  try {
    await adminAuth.verifyIdToken(idToken);
  } catch {
    return { ok: false, error: 'Invalid token' };
  }

  // Create a session cookie (14-day expiry)
  const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

  const cookieStore = await cookies();
  cookieStore.set('session', sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  return { ok: true, data: { status: 'success' } };
}

export async function deleteSession(): Promise<ActionResult<{ status: string }>> {
  let user;
  try {
    user = await getServerUser();
    if (!user) {
      return { ok: false, error: 'No user session found' };
    }
  } catch {
    return { ok: false, error: 'Failed to get server user' };
  }

  // Firebase stores the revocation time in whole seconds, so a session
  // created in the same second as the logout stays valid.
  try {
    await adminAuth.revokeRefreshTokens(user.uid);
  } catch {
    return { ok: false, error: 'Failed to revoke session' };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
  } catch {
    return { ok: false, error: 'Failed to delete session cookie' };
  }

  return { ok: true, data: { status: 'success' } };
}
