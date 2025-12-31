import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

// Field type enum
const FieldType = z.enum([
  "text",
  "textarea",
  "number",
  "select",
  "multiselect",
  "checkbox",
  "date",
  "email",
  "phone",
  "url",
]);

// Field validation schema
const fieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  customMessage: z.string().optional(),
});

// Field schema
const fieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  type: FieldType,
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(z.string()).optional(), // For select/multiselect
  validation: fieldValidationSchema.optional(),
  order: z.number(),
});

// Application schema metadata
const schemaMetadataSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Schema name is required"),
  dhYear: z.string().min(1, "DH Year is required"),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
});

// Full application schema
const applicationSchemaSchema = schemaMetadataSchema.extend({
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});

export const applicationSchemaRouter = router({
  // Get all application schemas
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (
      !ctx.session.user.role.includes(Role.ADMIN) &&
      !ctx.session.user.role.includes(Role.REVIEWER)
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const schemas = await ctx.prisma.applicationSchema.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { fields: true },
        },
      },
    });

    return schemas;
  }),

  // Get a single schema by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        !ctx.session.user.role.includes(Role.ADMIN) &&
        !ctx.session.user.role.includes(Role.REVIEWER)
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const schema = await ctx.prisma.applicationSchema.findUnique({
        where: { id: input.id },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!schema) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Schema not found",
        });
      }

      return schema;
    }),

  // Create a new application schema
  create: protectedProcedure
    .input(applicationSchemaSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Check if schema with same name and year exists
      const existing = await ctx.prisma.applicationSchema.findFirst({
        where: {
          name: input.name,
          dhYear: input.dhYear,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "A schema with this name already exists for the specified year",
        });
      }

      const { fields, ...metadata } = input;

      const schema = await ctx.prisma.applicationSchema.create({
        data: {
          ...metadata,
          fields: {
            create: fields.map((field) => ({
              ...field,
              options: field.options ?? [],
            })),
          },
        },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });

      return schema;
    }),

  // Update an existing application schema
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: applicationSchemaSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, data } = input;

      // Check if schema exists
      const existing = await ctx.prisma.applicationSchema.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Schema not found",
        });
      }

      const { fields, ...metadata } = data;

      // Delete existing fields and create new ones
      await ctx.prisma.schemaField.deleteMany({
        where: { schemaId: id },
      });

      const schema = await ctx.prisma.applicationSchema.update({
        where: { id },
        data: {
          ...metadata,
          fields: {
            create: fields.map((field) => ({
              ...field,
              options: field.options ?? [],
            })),
          },
        },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });

      return schema;
    }),

  // Delete an application schema
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.applicationSchema.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Duplicate a schema
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const original = await ctx.prisma.applicationSchema.findUnique({
        where: { id: input.id },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!original) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Schema not found",
        });
      }

      const schema = await ctx.prisma.applicationSchema.create({
        data: {
          name: `${original.name} (Copy)`,
          dhYear: original.dhYear,
          description: original.description,
          isPublished: false,
          fields: {
            create: original.fields.map((field) => ({
              label: field.label,
              type: field.type as any,
              required: field.required,
              placeholder: field.placeholder ?? undefined,
              helpText: field.helpText ?? undefined,
              options: field.options,
              validation: field.validation as any,
              order: field.order,
            })),
          },
        },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });

      return schema;
    }),
});
