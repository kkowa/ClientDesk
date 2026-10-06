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
      error = "Please enter a valid password";
    } else {
      error = "Please check your information and try again";
    }
    return {ok: false, error: error };
  }

  // validate input with Zod
  const { name, email, password } = result.data;

  // check that the given email is not already registered
  const existingUser = await adminAuth.getUserByEmail(email).catch(() => null);
  if (existingUser) {
    return {ok: false, error: "This email is already registered" };
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
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: Role.Developer,
    });

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
    return {ok: false, error: "An error occurred while creating your account, please try again" };
  }

  return {ok: true, data: "Account created successfully" };
}
