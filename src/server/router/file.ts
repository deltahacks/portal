import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { env } from "../../env/server.mjs";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY_ID, R2_BUCKET_NAME } =
  env;

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_KEY_ID,
  },
});

export const fileUploadRouter = router({
  getUploadUrl: publicProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const signedUrl = await getSignedUrl(
          R2,
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: `${input.filename}`,
            ContentType: input.contentType,
          }),
          { expiresIn: 3600 },
        );

        return {
          url: signedUrl,
          method: "PUT" as const,
        };
      } catch (error) {
        console.error("Error generating signed URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),
  getDownloadUrl: publicProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: input.key,
        });

        const signedUrl = await getSignedUrl(R2, command, {
          expiresIn: 3600, // URL expires in 1 hour
        });

        return {
          url: signedUrl,
        };
      } catch (error) {
        console.error("Error generating download URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate download URL",
        });
      }
    }),
});
