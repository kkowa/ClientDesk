import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);

    if (decodedClaims.role !== Role.Developer) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  } catch (error) {
    console.log("Failed to verify session cookie:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/developer/dashboard/:path*"],
};