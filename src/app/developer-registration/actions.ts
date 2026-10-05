"use server"

import { redirect } from "next/navigation";
import { UserRecord, CreateRequest } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";


export async function registerDeveloper(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // validate input

  // create Firebase user
  const createRequest: CreateRequest = {
    email,
    password,
    displayName: name,
  };

  let developerId: string = "";
  try {
    const userRecord: UserRecord = await adminAuth.createUser(createRequest);

    await adminAuth.setCustomUserClaims(userRecord.uid, { role: Role.Developer });

    // create developer entry in the database
    await adminDb.collection("developers").doc(userRecord.uid).set({
      name,
      email,
      createdAt: new Date(),
    });
    
    developerId = userRecord.uid;

  } catch (error) {
    console.error("Error creating developer:", error);
  }

  if (developerId) {
    redirect("/login");
  } else {
    redirect("/developer-registration/error");
  }
}
