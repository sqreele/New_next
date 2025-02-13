import GoogleProvider from "next-auth/providers/google"; // Import GoogleProvider
import CredentialsProvider from "next-auth/providers/credentials";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextAuthOptions } from "next-auth";
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Axios request logging (conditional on environment)
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🌐 Making request to: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Axios response logging (conditional on environment)
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Successful response from: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Response error for ${error.config?.url}:`, {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      profile_image: string;
      positions: string;
      properties: any[];
      accessToken: string;
      refreshToken: string;
    }
  }

  interface User {
    id: string;
    username: string;
    email: string;
    profile_image: string;
    positions: string;
    properties: any[];
    accessToken: string;
    refreshToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          // Get JWT tokens
          const tokenResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/token/`,
            {
              username: credentials.username,
              password: credentials.password,
            }
          );

          // Get user data using auth check
          const authCheckResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/check/`,
            {
              headers: {
                Authorization: `Bearer ${tokenResponse.data.access}`
              }
            }
          );

          const { user } = authCheckResponse.data;

          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            accessToken: tokenResponse.data.access,
            refreshToken: tokenResponse.data.refresh,
            profile_image: user.profile?.profile_image || "default.jpg",
            positions: user.profile?.positions || "User",
            properties: user.profile?.properties || [],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Auth Error during token fetch:", {
              status: error.response?.status,
              data: error.response?.data,
              config: {
                url: error.config?.url,
                method: error.config?.method
              }
            });
          } else {
            console.error("Unknown Error:", error);
          }
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',  // Add fallback
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '', // Add fallback
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.profile_image = user.profile_image;
        token.positions = user.positions;
        token.properties = user.properties;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      if (token.accessToken) {
        const currentTime = Math.floor(Date.now() / 1000);

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined in environment variables.");
        }

        const decoded = jwt.verify(token.accessToken as string, process.env.JWT_SECRET) as JwtPayload;

        if (decoded) {
          const refreshThreshold = decoded.exp ? decoded.exp - 300 : 0;

          if (decoded.exp && currentTime >= refreshThreshold) {
            try {
              const refreshResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/token/refresh/`,
                {
                  refresh: token.refreshToken
                }
              );

              token.accessToken = refreshResponse.data.access;
              token.refreshToken = refreshResponse.data.refresh || token.refreshToken;
            } catch (error) {
              console.error("Error refreshing token:", error);
              return { ...token, error: "RefreshTokenError" };
            }
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        username: token.username as string,
        email: token.email as string,
        profile_image: token.profile_image as string,
        positions: token.positions as string,
        properties: token.properties as any[],
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };

      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
