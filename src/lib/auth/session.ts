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

  let sessionCookie;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }

  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
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

  let error;
  let user;

  // Attempt to get the server user, capturing any errors in the `error` variable
  // instead of returning immediately so that we can still attempt to delete the
  // session cookie, which must be done _after_ attempting to get the server user.
  try {
    user = await getServerUser();
    if (!user) {
      error = 'No user session found';
    }
  } catch {
    error = 'Failed to get server user';
  }

  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
  } catch (error) {
    console.error('Failed to delete session cookie', error);
    return { ok: false, error: (error as Error).message };
  }

  if (user) {
    try {
      // Firebase stores the revocation time in whole seconds, so a session
      // created in the same second as the logout stays valid.
      await adminAuth.revokeRefreshTokens(user.uid);
    } catch (error) {
      console.error('Failed to revoke session for user: ', user.uid, error);
      // Ideally, we would handle this error more gracefully, perhaps by retrying
      // the operation in a task queue with exponentially increasing wait times.
      // We are not returning error state here because it would ultimately
      // tell the user to retry logout, but they have already logged out and
      // will keep getting the "retry logout" message.
    }
  } else {
    return { ok: false, error: error ?? 'No user session found' };
  }

  return { ok: true, data: { status: 'success' } };
}
