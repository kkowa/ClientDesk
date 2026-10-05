import { Role } from "./role";

export type ServerUser = {
  uid: string;
  email?: string | null;
  role: Role;
};
