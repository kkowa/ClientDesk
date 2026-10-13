"use server";

import { UserRecord, CreateRequest } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";
import { developerRegistrationSchema } from "@/src/lib/validation/developer-registration";
import { ActionResult } from "@/src/types/action-result";

export async function registerDeveloper(formData: FormData): Promise<ActionResult<string>> {
  const result = developerRegistrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    const firstError = result.error.issues[0];

    let error = "";

    if (firstError.path.includes("name")) {
      error = "Please enter your name";
    } else if (firstError.path.includes("email")) {
      error = "Please enter a valid email address";
    } else if (firstError.path.includes("password")) {
      error = "Please enter a password of at least 6 characters";
    } else {
      error = "Please check your information and try again";
    }
    return {ok: false, error: error };
  }

  // validate input with Zod
  const { name, email, password } = result.data;

  let userRecord: UserRecord | null = null;
  try {
    // create the user in Firebase Auth
    const createRequest: CreateRequest = {
      email,
      password,
      displayName: name,
    };
    userRecord = await adminAuth.createUser(createRequest);
  } catch (error) {
    console.error("Error creating developer user account:", error);
    if (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/email-already-exists") {
      return { ok: false, error: "This email is already registered" };
    }
    return { ok: false, error: "We couldn't create your account, please try again" };
  }

  try {
    // set custom user claims for the role
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: Role.Developer,
    });
  } catch (error) {
    console.error("Error setting custom user claims:", error);
    try {
      await adminAuth.deleteUser(userRecord.uid);
    } catch (deleteError) {
      console.error("Error deleting developer user after claims failure: UID ", userRecord.uid, deleteError);
    }
    return { ok: false, error: "We couldn't create your account, please try again" };
  }

  // create document in the developers collection of the database
  let developerId: string | null = null;
  try {
    const docRef = await adminDb.collection("developers").add({
      authUserId: userRecord.uid,
      name,
      email,
      createdAt: new Date(),
    });

    // use this to reference the developer document later if needed
    developerId = docRef.id;
  } catch (error) {
    try {
      await adminAuth.deleteUser(userRecord.uid);
    } catch (deleteError) {
      console.error("Error deleting developer user after document creation failure: UID ", userRecord.uid, deleteError);
    }
    console.error("Error creating developer document for UID ", userRecord.uid, error);
    return { ok: false, error: "We couldn't create your account, please try again" };
  }

  if (!developerId) {
    return { ok: false, error: "An error occurred while creating your account" };
  }

  return { ok: true, data: "Account created successfully" };
}
