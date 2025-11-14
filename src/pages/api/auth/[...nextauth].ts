import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import AzureADProvider from "next-auth/providers/azure-ad";
import type { NextApiRequest, NextApiResponse } from "next";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    signIn({ account }) {
      // This callback runs on successful sign-in
      // We'll set the cookie in the handler below
      return true;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    }),
    AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
    }),
  ],
  events: {
    async signIn(message) {
      // Store provider and timestamp for cookie setting in handler
      // The actual cookie is set in the custom handler below
    },
  },
};

// Custom handler to set last login cookie
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Intercept OAuth callback to track provider and timestamp
  const isCallback = req.url?.includes("/callback/");

  if (isCallback) {
    // Extract provider from the URL path
    const urlMatch = req.url?.match(/\/callback\/([^?]+)/);
    const provider = urlMatch ? urlMatch[1] : "unknown";

    // Store the original setHeader to intercept it
    const originalSetHeader = res.setHeader.bind(res);

    // Override setHeader to add our custom cookie alongside NextAuth's cookies
    res.setHeader = function (name: string, value: string | string[]) {
      // Call original setHeader
      const result = originalSetHeader(name, value);

      // If NextAuth is setting cookies (Location header indicates redirect after auth)
      if (name === "Location" && typeof value === "string") {
        // Set our last-login cookie
        const cookieValue = JSON.stringify({
          timestamp: new Date().toISOString(),
          provider: provider,
        });

        // Max age: 1 year
        const maxAge = 365 * 24 * 60 * 60;

        // Get existing Set-Cookie headers
        const existingCookies = res.getHeader("Set-Cookie") || [];
        const cookiesArray = Array.isArray(existingCookies)
          ? existingCookies
          : [existingCookies.toString()];

        // Add our custom cookie
        cookiesArray.push(
          `last-login=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
        );

        // Set all cookies
        originalSetHeader("Set-Cookie", cookiesArray);
      }

      return result;
    } as typeof res.setHeader;
  }

  // Call the NextAuth handler
  return await NextAuth(req, res, authOptions);
}
