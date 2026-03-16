import { z } from "zod";

const maxLengthMessage = (field: string, max: number) =>
  `${field} must be ${max} characters or fewer`;

const optionalTextField = (field: string, max: number) =>
  z.union([z.literal(""), z.string().max(max, maxLengthMessage(field, max))]).optional();

export const createUserSchema = z.object({
  uid: z.string().trim().min(1, "UID is required").max(64, maxLengthMessage("UID", 64)),
  email: z
    .union([
      z.literal(""),
      z
        .string()
        .email("Invalid email address")
        .max(255, maxLengthMessage("Email", 255)),
    ])
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, maxLengthMessage("Name", 255)),
  used_name: optionalTextField("Used name", 255),
  company: optionalTextField("Company", 255),
  birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  email: z
    .union([
      z.literal(""),
      z
        .string()
        .email("Invalid email address")
        .max(255, maxLengthMessage("Email", 255)),
    ])
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, maxLengthMessage("Name", 255)),
  used_name: optionalTextField("Used name", 255),
  company: optionalTextField("Company", 255),
  birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().or(z.literal("")),
});

export const userListQuerySchema = z.object({
  email: z.string().optional(),
  name_like: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  page_size: z.coerce.number().min(1).max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
