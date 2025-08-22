// src/server/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from "./providers/prisma";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    jwt: async function({ token, user }) {
      if (user?.id) {
        // Fetch user data including isAdmin
        const userData = await db.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true }
        });
        token.isAdmin = userData?.isAdmin || false;
      }
      return token;
    },
    session: async function({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.sub as string;
          session.user.isAdmin = token.isAdmin as boolean;
        }
      } catch (err) {
        console.error(err);
      } finally {
        return session;
      }
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

