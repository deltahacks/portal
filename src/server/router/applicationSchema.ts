import { z } from "zod";
import { Role, Status } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "./trpc";

// Validation schemas
const FieldTypeEnum = z.enum([
  "text",
  "textarea",
  "number",
  "select",
  "multiselect",
  "checkbox",
  "date",
  "email",
  "url",
]);

const ApplicationFieldInput = z.object({
  label: z.string().min(1),
  type: FieldTypeEnum,
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(z.string()).optional(), // For select/multiselect
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  order: z.number().default(0),
});

const ApplicationSchemaInput = z.object({
  name: z.string().min(1),
  dhYear: z.string().regex(/^DH\d{1,2}$/),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
});

const ApplicationResponseInput = z.object({
  schemaId: z.string(),
  answers: z.record(z.string()),
});

const UpdateSchemaInput = ApplicationSchemaInput.partial();

const ManageFieldsInput = z.object({
  schemaId: z.string(),
  fields: z.array(ApplicationFieldInput),
});

export const applicationSchemaRouter = router({
  // Admin-only procedures
  createSchema: protectedProcedure
    .input(ApplicationSchemaInput)
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Check if schema with same name and year already exists
      const existing = await ctx.prisma.applicationSchema.findFirst({
        where: {
          name: input.name,
          dhYear: input.dhYear,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Schema with this name and year already exists",
        });
      }

      return await ctx.prisma.applicationSchema.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id,
        },
      });
    }),

  updateSchema: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: UpdateSchemaInput,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const schema = await ctx.prisma.applicationSchema.findUnique({
        where: { id: input.id },
      });

      if (!schema) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await ctx.prisma.applicationSchema.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  deleteSchema: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      // Check admin role
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const schema = await ctx.prisma.applicationSchema.findUnique({
        where: { id },
      });

      if (!schema) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Soft delete by setting isPublished to false
      return await ctx.prisma.applicationSchema.update({
        where: { id },
        data: { isPublished: false },
      });
    }),

  duplicateSchema: protectedProcedure
    .input(
      z.object({
        sourceSchemaId: z.string(),
        targetDhYear: z.string().regex(/^DH\d{1,2}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const sourceSchema = await ctx.prisma.applicationSchema.findUnique({
        where: { id: input.sourceSchemaId },
        include: { fields: true },
      });

      if (!sourceSchema) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Source schema not found",
        });
      }

      // Check if target schema already exists
      const existingTarget = await ctx.prisma.applicationSchema.findFirst({
        where: {
          name: sourceSchema.name,
          dhYear: input.targetDhYear,
        },
      });

      if (existingTarget) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Schema with same name already exists for target year",
        });
      }

      // Create new schema with duplicated fields
      const newSchema = await ctx.prisma.applicationSchema.create({
        data: {
          name: sourceSchema.name,
          dhYear: input.targetDhYear,
          description: sourceSchema.description,
          isPublished: false,
          createdBy: ctx.session.user.id,
          fields: {
            create: sourceSchema.fields.map((field) => ({
              label: field.label,
              type: field.type as any,
              required: field.required,
              placeholder: field.placeholder,
              helpText: field.helpText,
              options: field.options as string[] | undefined,
              validation: field.validation as any,
              order: field.order,
            })),
          },
        },
      });

      return newSchema;
    }),

  manageFields: protectedProcedure
    .input(ManageFieldsInput)
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const schema = await ctx.prisma.applicationSchema.findUnique({
        where: { id: input.schemaId },
      });

      if (!schema) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Delete existing fields and create new ones
      await ctx.prisma.applicationField.deleteMany({
        where: { schemaId: input.schemaId },
      });

      return await ctx.prisma.applicationSchema.update({
        where: { id: input.schemaId },
        data: {
          fields: {
            create: input.fields.map((field) => ({
              label: field.label,
              type: field.type as any,
              required: field.required,
              placeholder: field.placeholder,
              helpText: field.helpText,
              options: field.options,
              validation: field.validation as any,
              order: field.order,
            })),
          },
        },
        include: { fields: true },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        responseId: z.string(),
        status: z.enum(Status),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (
        !ctx.session.user.role.includes(Role.ADMIN) &&
        !ctx.session.user.role.includes(Role.REVIEWER)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const response = await ctx.prisma.applicationResponse.findUnique({
        where: { id: input.responseId },
      });

      if (!response) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await ctx.prisma.applicationResponse.update({
        where: { id: input.responseId },
        data: { status: input.status },
      });
    }),

  getSchemas: protectedProcedure
    .input(
      z
        .object({
          includeUnpublished: z.boolean().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin for unpublished schemas
      const isAdmin = ctx.session.user.role.includes(Role.ADMIN);

      const where: any = {};

      if (!isAdmin || !input?.includeUnpublished) {
        where.isPublished = true;
      }

      return await ctx.prisma.applicationSchema.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });
    }),

  getApplicationsBySchema: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: schemaId }) => {
      // Check if user is admin or reviewer
      if (
        !ctx.session.user.role.includes(Role.ADMIN) &&
        !ctx.session.user.role.includes(Role.REVIEWER)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const schema = await ctx.prisma.applicationSchema.findUnique({
        where: { id: schemaId },
      });

      if (!schema) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await ctx.prisma.applicationResponse.findMany({
        where: { schemaId },
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Public procedures
  getSchema: publicProcedure
    .input(
      z
        .object({
          id: z.string().optional(),
          dhYear: z
            .string()
            .regex(/^DH\d{1,2}$/)
            .optional(),
        })
        .refine((data) => data.id || data.dhYear, {
          message: "Either id or dhYear must be provided",
        }),
    )
    .query(async ({ ctx, input }) => {
      let schema;

      if (input.id) {
        schema = await ctx.prisma.applicationSchema.findUnique({
          where: { id: input.id },
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
        });
      } else if (input.dhYear) {
        // Find the latest published schema for the given year
        schema = await ctx.prisma.applicationSchema.findFirst({
          where: {
            dhYear: input.dhYear,
            isPublished: true,
          },
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }

      if (!schema) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return schema;
    }),

  // Authenticated procedures
  submitApplication: protectedProcedure
    .input(ApplicationResponseInput)
    .mutation(async ({ ctx, input }) => {
      const schema = await ctx.prisma.applicationSchema.findUnique({
        where: { id: input.schemaId },
        include: { fields: true },
      });

      if (!schema) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Schema not found" });
      }

      if (!schema.isPublished) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This application form is not currently accepting responses",
        });
      }

      // Check if user already submitted an application for this schema
      const existingResponse = await ctx.prisma.applicationResponse.findFirst({
        where: {
          schemaId: input.schemaId,
          userId: ctx.session.user.id,
        },
      });

      if (existingResponse) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already submitted an application for this form",
        });
      }

      // Validate required fields
      for (const field of schema.fields) {
        if (field.required && !input.answers[field.id]) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Field "${field.label}" is required`,
          });
        }
      }

      return await ctx.prisma.applicationResponse.create({
        data: {
          schemaId: input.schemaId,
          userId: ctx.session.user.id,
          answers: input.answers,
          status: Status.IN_REVIEW,
        },
      });
    }),

  getApplication: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: responseId }) => {
      const response = await ctx.prisma.applicationResponse.findUnique({
        where: { id: responseId },
        include: {
          schema: {
            include: {
              fields: {
                orderBy: { order: "asc" },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!response) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check if user has access (owner or admin/reviewer)
      const isOwner = response.userId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role.includes(Role.ADMIN);
      const isReviewer = ctx.session.user.role.includes(Role.REVIEWER);

      if (!isOwner && !isAdmin && !isReviewer) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return response;
    }),

  getMyApplication: protectedProcedure
    .input(
      z
        .object({
          schemaId: z.string().optional(),
          dhYear: z
            .string()
            .regex(/^DH\d{1,2}$/)
            .optional(),
        })
        .refine((data) => data.schemaId || data.dhYear, {
          message: "Either schemaId or dhYear must be provided",
        }),
    )
    .query(async ({ ctx, input }) => {
      let where: any = {
        userId: ctx.session.user.id,
      };

      if (input.schemaId) {
        where.schemaId = input.schemaId;
      } else if (input.dhYear) {
        // Find the schema for the given year
        const schema = await ctx.prisma.applicationSchema.findFirst({
          where: {
            dhYear: input.dhYear,
            isPublished: true,
          },
          select: { id: true },
          orderBy: { createdAt: "desc" },
        });

        if (schema) {
          where.schemaId = schema.id;
        } else {
          return null;
        }
      }

      const response = await ctx.prisma.applicationResponse.findFirst({
        where,
        include: {
          schema: {
            include: {
              fields: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      });

      return response;
    }),
});
