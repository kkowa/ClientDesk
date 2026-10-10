import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/src/lib/firebase/admin";
import { Role } from "@/src/types/role";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    if (decodedClaims.role !== Role.Developer) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  } catch (error) {
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? error.code
        : "unknown";

    console.error("Session verification failed", errorCode);

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/developer/dashboard/:path*"],
};
