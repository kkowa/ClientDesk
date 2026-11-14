import { WorkRequestStatus } from "@/src/types/work-request";
import { z } from "zod";

export const declineSchema = z.object({
  description: z.string().trim().min(1, "Reason for declining is required."),
  status: z.enum(WorkRequestStatus, { error: "Invalid status" }),
});
