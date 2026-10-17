export type Client = {
  authUserId: string;
  developerId: string;
  name: string;
  email: string;
  status: string;
  createdAt: string; // ISO date string, converted in lib/data
}