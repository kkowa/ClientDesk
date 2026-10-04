"use client"
  
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase/client";
import { User } from "firebase/auth";
import { createSession, deleteSession } from "@/src/lib/auth/session";
import { AuthError } from "firebase/auth";
import { ActionResult } from "@/src/types/action-result";


export async function signIn(email: string, password: string): Promise<ActionResult<User>> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    const sessionResult = await createSession(idToken);
    if (!sessionResult.ok) {
      return { ok: false, error: "Failed to create session" };
    }
    return { ok: true, data: credential.user };
  } catch (error) {
    return { ok: false, error: (error as AuthError).message };
  }
}

export async function signUp(email: string, password: string): Promise<ActionResult<User>> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    const sessionResult = await createSession(idToken);
    if (!sessionResult.ok) {
      return { ok: false, error: "Failed to create session" };
    }
    return { ok: true, data: credential.user };
  } catch (error) {
    return { ok: false, error: (error as AuthError).message };
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  await deleteSession();
}
