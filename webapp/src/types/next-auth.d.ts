// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      khcAdvocateId: string
      khcAdvocateName: string
      isVerified: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: UserRole
    khcAdvocateId: string
    khcAdvocateName: string
    isVerified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    khcAdvocateId: string
    khcAdvocateName: string
    isVerified: boolean
  }
}
// src/types/next-auth.d.ts
declare module 'next-auth' {
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
    accessToken?: string; // Add this
  }
}