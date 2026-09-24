import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/appwrite/config";

// Optimistic check only: every admin page and action verifies the session again on the server.
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
