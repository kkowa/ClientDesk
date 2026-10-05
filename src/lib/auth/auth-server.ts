import "server-only"

import { cookies } from "next/headers";
import { adminAuth } from "@/src/lib/firebase/admin";
import { ServerUser } from "@/src/types/server-user";
import { Role } from "@/src/types/role";


export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  try {
    const token =  await adminAuth.verifySessionCookie(session, true);
    return {
      uid: token.uid,
      email: token.email ?? null,
      role: token.role as Role,
    };
  } catch {
    return null;
  }
}
