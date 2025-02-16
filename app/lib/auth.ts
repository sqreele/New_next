import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextAuthOptions } from "next-auth";
import axios from 'axios';

// Enhanced types for better type safety
interface AuthUser {
  id: string;
  username: string;
  email: string;
  profile_image: string;
  positions: string;
  properties: any[];
  accessToken: string;
  refreshToken: string;
}

interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
  email_verified: boolean;
}

// Environment variables with fallbacks
const API_URL = typeof window === 'undefined'
  ? process.env.NEXT_PRIVATE_API_URL || 'http://django-backend:8000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://pmcs.site';

// Ensure secrets are available
const getSecrets = () => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

  if (!JWT_SECRET || !NEXTAUTH_SECRET) {
    console.error('Missing required environment variables:', {
      JWT_SECRET: !!JWT_SECRET,
      NEXTAUTH_SECRET: !!NEXTAUTH_SECRET,
    });
    throw new Error("Required secrets are not defined in environment variables");
  }

  return { JWT_SECRET, NEXTAUTH_SECRET };
};

// Create axios instance with environment-aware configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  proxy: false,
  maxRedirects: 5,
  validateStatus: (status) => status >= 200 && status < 500,
});

// Add request/response interceptors with timestamps
api.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === "development") {
      console.log(`[${timestamp}] 🌐 Making request to: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === "development") {
      console.log(`[${timestamp}] ✅ Successful response from: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    if (axios.isAxiosError(error)) {
      console.error(`[${timestamp}] ❌ Response error for ${error.config?.url}:`, {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

// NextAuth type declarations
declare module "next-auth" {
  interface Session {
    user: AuthUser;
    error?: string;
  }

  interface User extends AuthUser {}
}

// Helper function for token refresh
async function refreshAccessToken(token: any) {
  try {
    const response = await api.post('/api/v1/token/refresh/', {
      refresh: token.refreshToken
    });

    return {
      ...token,
      accessToken: response.data.access,
      refreshToken: response.data.refresh || token.refreshToken,
      error: undefined
    };
  } catch (error) {
    console.error("Token refresh failed:", error);
    return {
      ...token,
      error: "RefreshTokenError"
    };
  }
}

// Verify JWT token helper
const verifyToken = (token: string): JwtPayload | null => {
  try {
    const { JWT_SECRET } = getSecrets();
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

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
          throw new Error("Missing credentials");
        }

        try {
          const tokenResponse = await api.post('/api/v1/token/', {
            username: credentials.username,
            password: credentials.password,
          });

          const authCheckResponse = await api.get('/api/v1/auth/check/', {
            headers: {
              Authorization: `Bearer ${tokenResponse.data.access}`
            }
          });

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
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
        }
      },
      profile(profile: GoogleProfile): AuthUser {
        return {
          id: profile.sub,
          username: profile.name,
          email: profile.email,
          profile_image: profile.picture,
          positions: "User",
          properties: [],
          accessToken: "",
          refreshToken: "",
        };
      },
    })
  ],

  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        try {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] 🔑 Processing Google sign-in for: ${profile?.email}`);

          const response = await api.post('/api/v1/auth/google/', {
            access_token: account.access_token,
            id_token: account.id_token,
            email: profile?.email,
            name: profile?.name,
            picture: profile?.image
          });

          if (response.data) {
            user.accessToken = response.data.access;
            user.refreshToken = response.data.refresh;
            user.positions = response.data.positions || user.positions;
            user.properties = response.data.properties || user.properties;
            
            console.log(`[${timestamp}] ✅ Successfully authenticated with Google: ${profile?.email}`);
            return true;
          }
        } catch (error) {
          const timestamp = new Date().toISOString();
          console.error(`[${timestamp}] ❌ Google auth error for ${profile?.email}:`, error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      if (user) {
        Object.assign(token, {
          id: user.id,
          username: user.username,
          email: user.email,
          profile_image: user.profile_image,
          positions: user.positions,
          properties: user.properties,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        });
      }

      if (token.accessToken) {
        const currentTime = Math.floor(Date.now() / 1000);
        const decoded = verifyToken(token.accessToken as string);

        if (decoded?.exp && currentTime >= decoded.exp - 300) {
          return refreshAccessToken(token);
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

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    }
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },

  secret: getSecrets().NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
