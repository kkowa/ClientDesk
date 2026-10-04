import "server-only"

import { cookies } from "next/headers";
import { adminAuth } from "@/src/lib/firebase/admin";
import { DecodedIdToken } from "firebase-admin/auth";


export async function getServerUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}
