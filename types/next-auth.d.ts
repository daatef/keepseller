import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isSubscribed?: boolean;
      tenantSchema?: string;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    isSubscribed?: boolean;
    tenantSchema?: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    isSubscribed?: boolean;
    tenantSchema?: string;
    isAdmin?: boolean;
  }
}


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSubscribed: boolean;
    } & DefaultSession["user"];
  }
}