import { z } from "zod";

export const clientAccountSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.email("Please enter a valid email address").trim(),
});

export const clientRegistrationSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
