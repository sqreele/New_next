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

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request/response interceptors
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
    user: AuthUser;
    error?: string;
  }

  interface User extends AuthUser {}
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
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        try {
          // Create or get user in your backend
          const response = await api.post('/api/v1/auth/google/', {
            access_token: account.access_token,
            id_token: account.id_token,
            email: profile?.email,
          });

          if (response.data) {
            user.accessToken = response.data.access;
            user.refreshToken = response.data.refresh;
            // Add any other user data from your backend
            return true;
          }
        } catch (error) {
          console.error("Google auth error:", error);
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

        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined");
        }

        try {
          const decoded = jwt.verify(token.accessToken as string, process.env.JWT_SECRET) as JwtPayload;
          const refreshThreshold = decoded.exp ? decoded.exp - 300 : 0;

          if (decoded.exp && currentTime >= refreshThreshold) {
            try {
              const refreshResponse = await api.post('/api/v1/token/refresh/', {
                refresh: token.refreshToken
              });

              return {
                ...token,
                accessToken: refreshResponse.data.access,
                refreshToken: refreshResponse.data.refresh || token.refreshToken,
                error: undefined
              };
            } catch (error) {
              console.error("Token refresh failed:", error);
              return { ...token, error: "RefreshTokenError" };
            }
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          return { ...token, error: "TokenVerificationError" };
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
      if (url.startsWith(baseUrl)) {
        return url;
      } else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
