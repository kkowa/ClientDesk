import { z } from "zod";

export const developerRegistrationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});
