// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";

interface CustomToken extends JWT {
  accessTokenExpires?: number;
  error?: string;
}

export default withAuth(
  function middleware(req) {
    // Get token and type it properly
    const token = req.nextauth.token as CustomToken;

    // Check for refresh token error
    if (token?.error === "RefreshAccessTokenError") {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
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