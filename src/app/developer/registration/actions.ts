"use server"

import { redirect } from "next/navigation";
import { UserRecord, CreateRequest } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";


export async function registerDeveloper(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // validate input with Zod

  // check that the given email is not already registered
  const existingUser = await adminAuth.getUserByEmail(email).catch(() => null);
  if (existingUser) {
    redirect(`/developer/registration/error?reason=email_already_registered`);
  }

  let developerId: string | null = null;
  try {
    // create the user in Firebase Auth
    const createRequest: CreateRequest = {
      email,
      password,
      displayName: name,
    };
    const userRecord: UserRecord = await adminAuth.createUser(createRequest);

    // set custom user claims for the role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: Role.Developer });

    // create document in the developers collection of the database
    const docRef = await adminDb.collection("developers").add({
      authUserId: userRecord.uid,
      name,
      email,
      createdAt: new Date(),
    });

    // use this to reference the developer document later if needed
    developerId = docRef.id;

  } catch (error) {
    console.error("Error creating developer:", error);
  }

  if (!developerId) {
    redirect("/developer/registration/error");
  }

  // redirect to the login page after successful registration
  redirect("/auth/login");
}
