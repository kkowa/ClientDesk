"use client"

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase/client";
import { User } from "firebase/auth";
import { createSession, deleteSession } from "@/src/lib/auth/session";
import { AuthError } from "firebase/auth";
import { ActionResult } from "@/src/types/action-result";


export async function signIn(email: string, password: string): Promise<ActionResult<User>> {
  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    return { ok: false, error: (error as AuthError).message };
  }

  let idToken;
  try {
    idToken = await credential.user.getIdToken();
  } catch (error) {
    if (auth.currentUser) {
      try {
        await firebaseSignOut(auth);
      } catch (signOutError) {
        console.error("Failed to sign out after token retrieval failure:", (signOutError as AuthError).message);
      }
    }
    return { ok: false, error: (error as AuthError).message };
  }

  let sessionResult;
  try {
    sessionResult = await createSession(idToken);
  } catch (error) {
    if (auth.currentUser) {
      try {
        await firebaseSignOut(auth);
      } catch (signOutError) {
        console.error("Failed to sign out after session creation failure:", (signOutError as AuthError).message);
      }
    }
    return { ok: false, error: (error as AuthError).message };
  }

  if (!sessionResult.ok) {
    if (auth.currentUser) {
      try {
        await firebaseSignOut(auth);
      } catch (signOutError) {
        console.error("Failed to sign out after session creation failure:", (signOutError as AuthError).message);
      }
    }
    return { ok: false, error: "Failed to create session" };
  }
  return { ok: true, data: credential.user };
}

export async function signOut(): Promise<ActionResult<{ status: string }>> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Failed to sign out:", (error as AuthError).message);
    return { ok: false, error: (error as AuthError).message };
  }

  try {
    const result = await deleteSession();
    if (!result.ok) {
      return { ok: false, error: "Failed to delete session" };
    }
  } catch (error) {
    console.error("Failed to delete session:", (error as AuthError).message);
    return { ok: false, error: "Failed to delete session" };
  }

  return { ok: true, data: { status: 'success' } };
}
