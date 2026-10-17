// app/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getPrismaForTenant } from "@/lib/prisma-tenant";
import { initTenantSchema } from "@/utils/init-tenant-schema";

const adminEmail = process.env.ADMIN_EMAIL!;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      issuer: "https://github.com/login/oauth",

    }),

    // ✅ Add demo credentials provider here
    Credentials({
      id: "demo",
      name: "Demo Login",
      async authorize() {
        // Only fetch the existing user
        const demoUser = await prisma.user.findUnique({
          where: { email: "mekketsoftware@gmail.com" }, // must exist
        });

        if (!demoUser) {
          return null; // login fails if not found
        }

        return demoUser; // NextAuth creates a session
      },
    }),
  ],

  session: { strategy: "jwt" },


  callbacks: {
   async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id; // 🔥 مهم عشان session.user.id
        token.tenantSchema = `tenant_${user.id.replace(/-/g, "_")}`;
      }

      const email = token.email ?? user?.email;
      const isAdmin = email === adminEmail;
      token.isAdmin = isAdmin;

      if (email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) token.isSubscribed = dbUser.isSubscribed;
        } catch (err) {
          console.warn("⚠️ Could not retrieve user:", err);
        }
      }

      return token;
    },

   async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string; // 🔥 ده أهم سطر
        session.user.tenantSchema = token.tenantSchema as string;
        session.user.isSubscribed = token.isSubscribed as boolean;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },

  
events: {
  async signIn({ user }) {
    if (!user?.id || !user.email) return;

    // ✅ Increment loginCount safely
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginCount: {
            increment: 1,
          },
        },
      });
    } catch (err) {
      console.error("⚠️ Could not increment login count:", err);
    }

    // 🔹 Tenant schema initialization
    const schema = `tenant_${user.id.replace(/-/g, "_")}`;
    try {
      // Create schema if not exists
      await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

      // Initialize tables only if empty
      await initTenantSchema(schema);

      console.log(`✅ Tenant schema ready for user ${user.email}`);
    } catch (err) {
      console.error(`⚠️ Could not initialize tenant schema "${schema}":`, err);
    }
  },
},

  pages: {
    signIn: "/auth/signin",
  },
});
