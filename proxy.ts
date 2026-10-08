import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/src/lib/firebase/admin";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  try {
    await adminAuth.verifySessionCookie(sessionCookie);
  } catch (error) {
    console.log("Failed to verify session cookie:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/developer/dashboard/:path*"],
};