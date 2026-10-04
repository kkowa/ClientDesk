// export type Role = "client" | "developer";

export enum Role {
  Client = "client",
  Developer = "developer",
}

export type ServerUser = {
  uid: string;
  email?: string | null;
  role: Role;
};
