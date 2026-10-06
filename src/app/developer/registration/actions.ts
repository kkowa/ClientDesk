"use server";

import { redirect } from "next/navigation";
import { UserRecord, CreateRequest } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";
import { developerRegistrationSchema } from "@/src/lib/validation/developer-registration";

export async function registerDeveloper(formData: FormData) {
  const result = developerRegistrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    const firstError = result.error.issues[0];

    if (firstError.path.includes("name")) {
      redirect(`/developer/registration/error?reason=invalid_name`);
    }
    if (firstError.path.includes("email")) {
      redirect(`/developer/registration/error?reason=invalid_email`);
    }
    if (firstError.path.includes("password")) {
      redirect(`/developer/registration/error?reason=invalid_password`);
    }

    redirect(`/developer/registration/error?reason=invalid_input`);
  }

  // validate input with Zod
  const { name, email, password } = result.data;

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
    redirect("/developer/registration/error");
  }

  // redirect to the login page after successful registration
  redirect("/auth/login");
}
