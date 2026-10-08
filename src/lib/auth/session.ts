"use server"

import { cookies } from "next/headers";
import { adminAuth } from "@/src/lib/firebase/admin";
import type { ActionResult } from "@/src/types/action-result";


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
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { ok: true, data: { status: 'success' } };
}
