// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  // Database
  DATABASE_URL: z.url(),

  // Environment
  NODE_ENV: z.enum(["development", "test", "production"]),

  // Authentication
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.url(),

  // OAuth Providers
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  LINKEDIN_CLIENT_ID: z.string(),
  LINKEDIN_CLIENT_SECRET: z.string(),
  AZURE_AD_CLIENT_ID: z.string(),
  AZURE_AD_CLIENT_SECRET: z.string(),
  AZURE_AD_TENANT_ID: z.string(),

  // External Services
  TYPEFORM_API_KEY: z.string(),
  SENDGRID_API_KEY: z.string(),
  LOGSNAG_TOKEN: z.string(),
  POSTHOG_KEY: z.string(),

  // Cloud Storage (R2)
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_KEY_ID: z.string(),
  R2_BUCKET_NAME: z.string(),

  // Apple Wallet Configuration
  // APPLE_WWDR: z.string(),
  // APPLE_SIGNER_CERT: z.string(),
  // APPLE_SIGNER_KEY: z.string(),
  // APPLE_SIGNER_KEY_PASSPHRASE: z.string(),

  GOOGLE_WALLET_ISSUER_ID: z.string().optional(),
  GOOGLE_WALLET_CLASS_ID: z.string().optional(),
  GOOGLE_WALLET_SERVICE_KEY_FILE: z.string().optional(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_BAR: z.string(),
  // NEXT_PUBLIC_SYNCFUSION_KEY: z.string(),
  NEXT_PUBLIC_URL: z.url(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
};
