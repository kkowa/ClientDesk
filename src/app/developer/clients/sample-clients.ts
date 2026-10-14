// TEMPORARY: stand-in for Kim's data functions while the pages are built.
// Once src/lib/data/get-clients.ts lands, switch the page imports to it and delete this file.
import type { Client } from "@/src/types/client";

const SAMPLE_CLIENTS: Client[] = [
  {
    authUserId: "sample-client-1",
    developerId: "sample-developer",
    name: "Ada Lovelace",
    email: "ada@example.com",
    status: "active",
    createdAt: new Date("2026-10-08"),
  },
  {
    authUserId: "sample-client-2",
    developerId: "sample-developer",
    name: "Grace Hopper",
    email: "grace@example.com",
    status: "invited",
    createdAt: new Date("2026-10-11"),
  },
];

// return [] here to check the empty state
export async function getClientsForDeveloper(developerAuthId: string): Promise<Client[]> {
  return SAMPLE_CLIENTS;
}

export async function getClientForDeveloper(
  developerAuthId: string,
  clientId: string,
): Promise<Client | null> {
  return SAMPLE_CLIENTS.find((client) => client.authUserId === clientId) ?? null;
}
