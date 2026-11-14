import { z } from "zod";
import { WorkRequestStatus } from "@/src/types/work-request";

export const proposalSchema = z.object({
  description: z.string().trim().min(1, "Proposal description is required."),
  status: z.enum(WorkRequestStatus, { error: "Invalid status" }),
  revision: z.coerce.number().int("Revision must be an integer")
});
