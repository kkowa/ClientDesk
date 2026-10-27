import { Role } from "./role";

export type Comment = {
  workRequestId: string;
  authorId: string;
  authorRole: Role;
  text: string;
  createdAt: Date;
}