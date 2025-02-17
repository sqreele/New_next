// auth/types.ts
import { JWT } from 'next-auth/jwt';
import { DefaultSession } from 'next-auth';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  profile_image: string;
  positions: string;
  properties: any[];
  accessToken: string;
  refreshToken: string;
}

export interface ExtendedSession extends DefaultSession {
  user: AuthUser;
  error?: AuthError;
}

// Fix the JWT interface by making id required
export interface ExtendedJWT extends JWT {
  id: string;  // Make id required instead of optional
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
  profile_image: string;
  positions: string;
  properties: any[];
  error?: AuthError;
}

export type AuthError = 
  | 'TokenExpired'
  | 'RefreshTokenError'
  | 'AuthenticationError';

declare module 'next-auth' {
  interface Session extends ExtendedSession {}
  interface JWT extends ExtendedJWT {}
  interface User extends AuthUser {}
}