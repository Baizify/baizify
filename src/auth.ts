// src/server/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from "./providers/prisma";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: "cmVndWxhcmF0b21odXJ0cGxhbnRpbnN0cnVtZW50c2VwYXJhdGVmbG9hdGluZ2NsaW0=",
  providers: [
    GoogleProvider({
      clientId: "176018053432-hm50eogols03oh3gl48knv42ilmco11s.apps.googleusercontent.com",
      clientSecret: "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",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

