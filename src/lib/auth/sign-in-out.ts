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

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Failed to sign out:", (error as AuthError).message);
  }

  // try to delete session even if firebaseSignOut fails
  try {
    await deleteSession();
  } catch (error) {
    console.error("Failed to delete session:", (error as AuthError).message);
  }
}
