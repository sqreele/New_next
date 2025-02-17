import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { JWT } from 'next-auth/jwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create and configure axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Add logging interceptors for development
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log(`[${new Date().toISOString()}] 🌐 Request: ${config.url}`);
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`[${new Date().toISOString()}] ✅ Response: ${response.config.url}`);
      return response;
    },
    (error) => {
      if (axios.isAxiosError(error)) {
        console.error(`[${new Date().toISOString()}] ❌ Error:`, {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      return Promise.reject(error);
    }
  );
}

// Token management functions
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/api/v1/token/refresh/', {
      refresh: token.refreshToken
    });

    if (!response.data.access) {
      throw new Error('No access token in refresh response');
    }

    return {
      ...token,
      accessToken: response.data.access,
      refreshToken: response.data.refresh || token.refreshToken,
      error: undefined
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return {
      ...token,
      error: 'RefreshTokenError' as const
    };
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          const tokenResponse = await api.post('/api/v1/token/', {
            username: credentials.username,
            password: credentials.password
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
            profile_image: user.profile?.profile_image || 'default.jpg',
            positions: user.profile?.positions || 'User',
            properties: user.profile?.properties || []
          };
        } catch (error) {
          console.error('Auth Error:', error);
          return null;
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          username: profile.name,
          email: profile.email,
          profile_image: profile?.picture || '',
          positions: 'User',
          properties: [],
          accessToken: '',
          refreshToken: ''
        };
      }
    })
  ],

  callbacks: {
    async signIn({ account, profile, user }: { account: any; profile?: { picture?: string; image?: string; email?: string; name?: string }; user: any }) {
      if (account?.provider === 'google' && profile) {
        try {
          const response = await api.post('/api/v1/auth/google/', {
            access_token: account.access_token,
            id_token: account.id_token,
            email: profile.email,
            name: profile.name,
            picture: profile.picture || profile.image || ''
          });

          if (response.data) {
            Object.assign(user, {
              accessToken: response.data.access,
              refreshToken: response.data.refresh,
              positions: response.data.positions || user.positions,
              properties: response.data.properties || user.properties
            });
            return true;
          }
        } catch (error) {
          console.error('Google auth error:', error);
          return false;
        }
      }
      return true;
    }, // ✅ Added missing comma here

    async jwt({ token, user, account }) {
      // Initial sign-in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          username: user.username,
          email: user.email,
          profile_image: user.profile_image,
          positions: user.positions,
          properties: user.properties,
          id: user.id
        };
      }

      // Check token expiration
      if (token.accessToken && !isTokenExpired(token.accessToken)) {
        return token;
      }

      // Token has expired, try to refresh
      return refreshAccessToken(token);
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
        refreshToken: token.refreshToken as string
      };

      if (token.error) {
        session.error = token.error;
      }

      return session;
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};

export default authOptions;
