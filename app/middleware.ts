// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware"; // Import NextRequestWithAuth for better type safety

interface CustomToken extends JWT {
  accessTokenExpires?: number;
  error?: string;
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) { // Use NextRequestWithAuth for request type
    // Get token and type it properly
    const token = req.nextauth.token as CustomToken;

    // Check for refresh token error
    if (token?.error === "RefreshAccessTokenError") {
      return NextResponse.redirect(new URL("/signin?error=RefreshTokenError", req.url)); // Include error in query parameter
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }: { token: JWT | null }) => !!token // Explicitly type token in authorized callback
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/jobs/:path*",
  ]
};