// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { compare } from 'bcryptjs';
import { UserRole } from '@prisma/client';

// Extend the built-in types
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    khcAdvocateId: string;
    khcAdvocateName: string;
    isVerified: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      khcAdvocateId: string;
      khcAdvocateName: string;
      isVerified: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    khcAdvocateId: string;
    khcAdvocateName: string;
    isVerified: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'advocate@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim() 
            },
            select: {
              id: true,
              email: true,
              passwordHash: true,
              khcAdvocateId: true,
              khcAdvocateName: true,
              role: true,
              isActive: true,
              isVerified: true
            }
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Account is inactive. Please contact support.');
          }

          // Verify password
          const isPasswordValid = await compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Update last login (fire and forget)
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          }).catch(err => console.error('Failed to update last login:', err));

          // Return user object for JWT
          return {
            id: user.id,
            email: user.email,
            name: user.khcAdvocateName,
            role: user.role,
            khcAdvocateId: user.khcAdvocateId,
            khcAdvocateName: user.khcAdvocateName,
            isVerified: user.isVerified,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.khcAdvocateId = user.khcAdvocateId;
        token.khcAdvocateName = user.khcAdvocateName;
        token.isVerified = user.isVerified;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.khcAdvocateName) token.khcAdvocateName = session.khcAdvocateName;
        if (typeof session.isVerified !== 'undefined') token.isVerified = session.isVerified;
      }

      return token;
    },

    async session({ session, token }) {
      // Add custom fields to session from token
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.khcAdvocateId = token.khcAdvocateId;
        session.user.khcAdvocateName = token.khcAdvocateName;
        session.user.isVerified = token.isVerified;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL, return baseUrl
      }
      
      return baseUrl;
    }
  },

  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/dashboard'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',

  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token?.email || 'unknown'}`);
    },
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

function generateCustomToken(userId: string): string {
  // Generate a custom token if needed
  return `custom_${userId}_${Date.now()}`;
}