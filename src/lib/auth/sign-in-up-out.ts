"use client"
  
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase/client";
import { User } from "firebase/auth";
import { createSession, deleteSession } from "@/src/lib/auth/session";


export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    const sessionResult = await createSession(idToken);
    if (!sessionResult.ok) {
      return null;
    }
    return credential.user;
  } catch (error) {
    return null;
  }
}

export async function signUp(email: string, password: string): Promise<User | null> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    const sessionResult = await createSession(idToken);
    if (!sessionResult.ok) {
      return null;
    }
    return credential.user;
  } catch (error) {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  await deleteSession();
}
