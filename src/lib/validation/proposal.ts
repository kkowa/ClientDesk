import { z } from "zod";

export const proposalSchema = z.object({
  description: z.string().trim().min(1, "Proposal description is required."),
});